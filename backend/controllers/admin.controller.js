const bcrypt = require('bcryptjs');
const { supabaseAdmin } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * GET /api/admin/users
 * List all registered users
 */
const getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('users')
      .select('id, name, email, role, status, availability, employee_id, profile_photo_url, created_at, updated_at', { count: 'exact' });

    if (role) query = query.eq('role', role);
    if (status) query = query.eq('status', status);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

    const offset = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      return errorResponse(res, 'Failed to fetch users.', 500);
    }

    return successResponse(res, {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse(res, 'Server error fetching users.');
  }
};

/**
 * PUT /api/admin/users/:id/status
 * Activate or deactivate a user account
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return errorResponse(res, 'Invalid status. Must be "active" or "inactive".', 400);
    }

    // Prevent deactivating the last admin
    if (status === 'inactive') {
      const { data: targetUser } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', id)
        .single();

      if (targetUser?.role === 'admin') {
        const { count } = await supabaseAdmin
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin')
          .eq('status', 'active');

        if (count <= 1) {
          return errorResponse(res, 'Cannot deactivate the last active admin account.', 400);
        }
      }
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, name, email, role, status')
      .single();

    if (error || !user) {
      return errorResponse(res, 'User not found.', 404);
    }

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      actor_id: req.user.id,
      action: `user_${status === 'active' ? 'activated' : 'deactivated'}`,
      target_type: 'user',
      target_id: id,
      details: { user_name: user.name, user_role: user.role }
    });

    return successResponse(res, { user }, `User ${status === 'active' ? 'activated' : 'deactivated'} successfully.`);
  } catch (error) {
    console.error('Update user status error:', error);
    return errorResponse(res, 'Server error updating user status.');
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Change a user's role
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['community_member', 'facility_manager', 'worker', 'admin'].includes(role)) {
      return errorResponse(res, 'Invalid role.', 400);
    }

    const { data: oldUser } = await supabaseAdmin
      .from('users')
      .select('role, name')
      .eq('id', id)
      .single();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, name, email, role, status')
      .single();

    if (error || !user) {
      return errorResponse(res, 'User not found.', 404);
    }

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      actor_id: req.user.id,
      action: 'role_change',
      target_type: 'user',
      target_id: id,
      details: { old_role: oldUser?.role, new_role: role, user_name: user.name }
    });

    return successResponse(res, { user }, 'User role updated successfully.');
  } catch (error) {
    console.error('Update user role error:', error);
    return errorResponse(res, 'Server error updating user role.');
  }
};

/**
 * POST /api/admin/users
 * Create a new user account (Admin creates workers/FM)
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, employee_id } = req.body;

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        name,
        email,
        password_hash,
        role,
        status: 'active',
        employee_id: employee_id || null
      })
      .select('id, name, email, role, status, created_at')
      .single();

    if (error) {
      return errorResponse(res, 'Failed to create user.', 500);
    }

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      actor_id: req.user.id,
      action: 'user_created',
      target_type: 'user',
      target_id: user.id,
      details: { user_name: user.name, user_role: user.role }
    });

    return successResponse(res, { user }, 'User created successfully.', 201);
  } catch (error) {
    console.error('Create user error:', error);
    return errorResponse(res, 'Server error creating user.');
  }
};

/**
 * GET /api/admin/pending-approvals
 * Get FM team registration requests pending approval
 */
const getPendingApprovals = async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, employee_id, status, created_at')
      .eq('status', 'pending_approval')
      .order('created_at', { ascending: true });

    if (error) {
      return errorResponse(res, 'Failed to fetch pending approvals.', 500);
    }

    return successResponse(res, { users });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    return errorResponse(res, 'Server error fetching pending approvals.');
  }
};

/**
 * PUT /api/admin/approve/:id
 * Approve or reject an FM registration
 */
const approveRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // true or false

    const newStatus = approved ? 'active' : 'inactive';

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending_approval')
      .select('id, name, email, role, status')
      .single();

    if (error || !user) {
      return errorResponse(res, 'Pending approval not found.', 404);
    }

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      actor_id: req.user.id,
      action: approved ? 'registration_approved' : 'registration_rejected',
      target_type: 'user',
      target_id: id,
      details: { user_name: user.name }
    });

    return successResponse(res, { user }, `Registration ${approved ? 'approved' : 'rejected'} successfully.`);
  } catch (error) {
    console.error('Approve registration error:', error);
    return errorResponse(res, 'Server error processing approval.');
  }
};

/**
 * GET /api/admin/audit-log
 * View system audit trail
 */
const getAuditLog = async (req, res) => {
  try {
    const { action, date_from, date_to, page = 1, limit = 50 } = req.query;

    let query = supabaseAdmin
      .from('audit_log')
      .select(`
        *,
        actor:users!audit_log_actor_id_fkey(id, name, email, role)
      `, { count: 'exact' });

    if (action) query = query.eq('action', action);
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);

    const offset = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: logs, error, count } = await query;

    if (error) {
      return errorResponse(res, 'Failed to fetch audit log.', 500);
    }

    return successResponse(res, {
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    return errorResponse(res, 'Server error fetching audit log.');
  }
};

/**
 * GET /api/admin/notifications
 * Get notifications for a user
 */
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only } = req.query;

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id);

    if (unread_only === 'true') {
      query = query.eq('is_read', false);
    }

    const offset = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: notifications, error, count } = await query;

    if (error) {
      return errorResponse(res, 'Failed to fetch notifications.', 500);
    }

    // Unread count
    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    return successResponse(res, {
      notifications,
      unread_count: unreadCount || 0,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse(res, 'Server error fetching notifications.');
  }
};

/**
 * PUT /api/admin/notifications/:id/read
 * Mark a notification as read
 */
const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      return errorResponse(res, 'Failed to mark notification as read.', 500);
    }

    return successResponse(res, null, 'Notification marked as read.');
  } catch (error) {
    console.error('Mark notification read error:', error);
    return errorResponse(res, 'Server error.');
  }
};

/**
 * PUT /api/admin/notifications/read-all
 * Mark all notifications as read
 */
const markAllNotificationsRead = async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.id)
      .eq('is_read', false);

    if (error) {
      return errorResponse(res, 'Failed to mark notifications as read.', 500);
    }

    return successResponse(res, null, 'All notifications marked as read.');
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return errorResponse(res, 'Server error.');
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  updateUserRole,
  createUser,
  getPendingApprovals,
  approveRegistration,
  getAuditLog,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
