const { supabaseAdmin } = require('../config/db');
const { successResponse, errorResponse, generateTrackingId } = require('../utils/helpers');

/**
 * POST /api/issues
 * Submit a new issue (Community Member)
 */
const createIssue = async (req, res) => {
  try {
    const { title, description, category_id, location_type, building, room_floor, location_description, latitude, longitude } = req.body;

    const tracking_id = generateTrackingId();

    // Handle photo upload if present
    let photo_url = null;
    if (req.file) {
      const fileName = `issues/${tracking_id}/${Date.now()}-${req.file.originalname}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('issue-photos')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) {
        console.error('Photo upload error:', uploadError);
        return errorResponse(res, 'Failed to upload photo.', 500);
      }

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('issue-photos')
        .getPublicUrl(fileName);

      photo_url = publicUrl;
    }

    const { data: issue, error } = await supabaseAdmin
      .from('issues')
      .insert({
        tracking_id,
        title,
        description,
        category_id,
        location_type,
        building: building || null,
        room_floor: room_floor || null,
        location_description: location_description || null,
        latitude: latitude || null,
        longitude: longitude || null,
        photo_url,
        submitted_by: req.user.id,
        status: 'pending'
      })
      .select(`
        *,
        category:categories(id, name, icon),
        submitter:users!issues_submitted_by_fkey(id, name, email)
      `)
      .single();

    if (error) {
      console.error('Create issue error:', error);
      return errorResponse(res, 'Failed to submit issue.', 500);
    }

    // Add initial status history
    await supabaseAdmin.from('status_history').insert({
      issue_id: issue.id,
      old_status: null,
      new_status: 'pending',
      changed_by: req.user.id,
      comment: 'Issue submitted'
    });

    // Save photo record if uploaded
    if (photo_url) {
      await supabaseAdmin.from('issue_photos').insert({
        issue_id: issue.id,
        photo_url,
        type: 'submission',
        uploaded_by: req.user.id
      });
    }

    return successResponse(res, { issue }, 'Issue submitted successfully!', 201);
  } catch (error) {
    console.error('Create issue error:', error);
    return errorResponse(res, 'Server error creating issue.');
  }
};

/**
 * GET /api/issues
 * Get all issues (Facility Manager / Admin)
 */
const getAllIssues = async (req, res) => {
  try {
    const { status, category_id, building, date_from, date_to, assigned_to, search, page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('issues')
      .select(`
        *,
        category:categories(id, name, icon),
        submitter:users!issues_submitted_by_fkey(id, name, email, profile_photo_url),
        worker:users!issues_assigned_to_fkey(id, name, email, profile_photo_url)
      `, { count: 'exact' });

    // Apply filters
    if (status) query = query.eq('status', status);
    if (category_id) query = query.eq('category_id', category_id);
    if (building) query = query.ilike('building', `%${building}%`);
    if (assigned_to) query = query.eq('assigned_to', assigned_to);
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);
    if (search) {
      query = query.or(`title.ilike.%${search}%,tracking_id.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: issues, error, count } = await query;

    if (error) {
      console.error('Get issues error:', error);
      return errorResponse(res, 'Failed to fetch issues.', 500);
    }

    return successResponse(res, {
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all issues error:', error);
    return errorResponse(res, 'Server error fetching issues.');
  }
};

/**
 * GET /api/issues/my
 * Get issues submitted by the logged-in community member
 */
const getMyIssues = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('issues')
      .select(`
        *,
        category:categories(id, name, icon),
        worker:users!issues_assigned_to_fkey(id, name, profile_photo_url)
      `, { count: 'exact' })
      .eq('submitted_by', req.user.id);

    if (status) query = query.eq('status', status);

    const offset = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: issues, error, count } = await query;

    if (error) {
      console.error('Get my issues error:', error);
      return errorResponse(res, 'Failed to fetch your issues.', 500);
    }

    return successResponse(res, {
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get my issues error:', error);
    return errorResponse(res, 'Server error fetching your issues.');
  }
};

/**
 * GET /api/issues/assigned
 * Get issues assigned to the logged-in worker
 */
const getAssignedIssues = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabaseAdmin
      .from('issues')
      .select(`
        *,
        category:categories(id, name, icon),
        submitter:users!issues_submitted_by_fkey(id, name, email, profile_photo_url)
      `, { count: 'exact' })
      .eq('assigned_to', req.user.id);

    if (status) {
      query = query.eq('status', status);
    } else {
      // By default, show active issues (not closed)
      query = query.in('status', ['assigned', 'in_progress']);
    }

    const offset = (page - 1) * limit;
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data: issues, error, count } = await query;

    if (error) {
      console.error('Get assigned issues error:', error);
      return errorResponse(res, 'Failed to fetch assigned issues.', 500);
    }

    return successResponse(res, {
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get assigned issues error:', error);
    return errorResponse(res, 'Server error fetching assigned issues.');
  }
};

/**
 * GET /api/issues/worker-history
 * Get resolved/completed issues for the logged-in worker
 */
const getWorkerHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const { data: issues, error, count } = await supabaseAdmin
      .from('issues')
      .select(`
        *,
        category:categories(id, name, icon),
        submitter:users!issues_submitted_by_fkey(id, name, email)
      `, { count: 'exact' })
      .eq('assigned_to', req.user.id)
      .in('status', ['resolved', 'closed'])
      .order('resolved_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get worker history error:', error);
      return errorResponse(res, 'Failed to fetch history.', 500);
    }

    return successResponse(res, {
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get worker history error:', error);
    return errorResponse(res, 'Server error fetching worker history.');
  }
};

/**
 * GET /api/issues/:id
 * Get issue details
 */
const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: issue, error } = await supabaseAdmin
      .from('issues')
      .select(`
        *,
        category:categories(id, name, icon),
        submitter:users!issues_submitted_by_fkey(id, name, email, profile_photo_url),
        worker:users!issues_assigned_to_fkey(id, name, email, profile_photo_url)
      `)
      .eq('id', id)
      .single();

    if (error || !issue) {
      return errorResponse(res, 'Issue not found.', 404);
    }

    // Get status history
    const { data: history } = await supabaseAdmin
      .from('status_history')
      .select(`
        *,
        changed_by_user:users!status_history_changed_by_fkey(id, name, role)
      `)
      .eq('issue_id', id)
      .order('created_at', { ascending: true });

    // Get comments
    const { data: comments } = await supabaseAdmin
      .from('comments')
      .select(`
        *,
        user:users!comments_user_id_fkey(id, name, role, profile_photo_url)
      `)
      .eq('issue_id', id)
      .order('created_at', { ascending: true });

    // Get photos
    const { data: photos } = await supabaseAdmin
      .from('issue_photos')
      .select('*')
      .eq('issue_id', id)
      .order('created_at', { ascending: true });

    return successResponse(res, {
      issue,
      history: history || [],
      comments: comments || [],
      photos: photos || []
    });
  } catch (error) {
    console.error('Get issue detail error:', error);
    return errorResponse(res, 'Server error fetching issue details.');
  }
};

/**
 * PUT /api/issues/:id/status
 * Update issue status (FM / Worker)
 */
const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment } = req.body;

    // ── Role-based status transition rules ───────────────────────────────
    const userRole = req.user.role;

    // Workers can only set in_progress (NOT resolved)
    if (userRole === 'worker') {
      if (status !== 'in_progress') {
        return errorResponse(res, 'Workers can only mark issues as in-progress.', 403);
      }
    }

    // Only FM/Admin can approve (set resolved) or close
    if (['resolved', 'closed'].includes(status) && !['facility_manager', 'admin'].includes(userRole)) {
      return errorResponse(res, 'Only Facility Managers can approve resolutions.', 403);
    }

    // Get current issue
    const { data: currentIssue, error: fetchError } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentIssue) {
      return errorResponse(res, 'Issue not found.', 404);
    }

    const updates = { status, updated_at: new Date().toISOString() };
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    if (status === 'closed') updates.closed_at = new Date().toISOString();

    // If FM is rejecting a resolution (setting back to in_progress), delete the old resolution photos
    if (status === 'in_progress' && ['facility_manager', 'admin'].includes(userRole)) {
      await supabaseAdmin.from('issue_photos').delete().eq('issue_id', id).eq('type', 'resolution');
    }

    const { data: issue, error } = await supabaseAdmin
      .from('issues')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, icon),
        submitter:users!issues_submitted_by_fkey(id, name, email),
        worker:users!issues_assigned_to_fkey(id, name, email)
      `)
      .single();

    if (error) {
      return errorResponse(res, 'Failed to update status.', 500);
    }

    // Record status change
    await supabaseAdmin.from('status_history').insert({
      issue_id: id,
      old_status: currentIssue.status,
      new_status: status,
      changed_by: req.user.id,
      comment: comment || `Status changed to ${status}`
    });

    // Notify relevant parties
    const notifyTargets = new Set();

    // Always notify the submitter about status changes (unless they changed it)
    if (currentIssue.submitted_by !== req.user.id) {
      notifyTargets.add({ userId: currentIssue.submitted_by, body: `Your issue "${currentIssue.title}" has been updated to ${status}.` });
    }

    // If FM approved or rejected, notify the assigned worker
    if (['resolved', 'in_progress'].includes(status)) {
      if (currentIssue.assigned_to && currentIssue.assigned_to !== req.user.id) {
        const actionText = status === 'resolved' ? 'approved your completion' : 'returned the issue to you for rework';
        await supabaseAdmin.from('notifications').insert({
          user_id: currentIssue.assigned_to,
          title: status === 'resolved' ? '✅ Resolution Approved' : '↩️ Review Rejected',
          body: `The Facility Manager has ${actionText} on issue "${currentIssue.title}".`,
          type: 'status_change',
          issue_id: id
        });
      }
    }

    // Generic notification to submitter (if not already notified above)
    if (currentIssue.submitted_by !== req.user.id) {
      await supabaseAdmin.from('notifications').insert({
        user_id: currentIssue.submitted_by,
        title: 'Issue Status Updated',
        body: `Your issue "${currentIssue.title}" has been updated to ${status}.`,
        type: 'status_change',
        issue_id: id
      });
    }

    return successResponse(res, { issue }, 'Issue status updated successfully.');
  } catch (error) {
    console.error('Update status error:', error);
    return errorResponse(res, 'Server error updating status.');
  }
};

/**
 * PUT /api/issues/:id/assign
 * Assign a worker to an issue (FM)
 */
const assignIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { worker_id } = req.body;

    // Verify worker exists and is a worker role
    const { data: worker, error: workerError } = await supabaseAdmin
      .from('users')
      .select('id, name, role, availability')
      .eq('id', worker_id)
      .eq('role', 'worker')
      .single();

    if (workerError || !worker) {
      return errorResponse(res, 'Worker not found.', 404);
    }

    // Get current issue
    const { data: currentIssue } = await supabaseAdmin
      .from('issues')
      .select('*, worker:users!issues_assigned_to_fkey(id, name)')
      .eq('id', id)
      .single();

    if (!currentIssue) {
      return errorResponse(res, 'Issue not found.', 404);
    }

    const oldWorkerId = currentIssue.assigned_to;

    // Update issue
    const { data: issue, error } = await supabaseAdmin
      .from('issues')
      .update({
        assigned_to: worker_id,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, icon),
        submitter:users!issues_submitted_by_fkey(id, name, email),
        worker:users!issues_assigned_to_fkey(id, name, email)
      `)
      .single();

    if (error) {
      return errorResponse(res, 'Failed to assign worker.', 500);
    }

    // Record status change
    await supabaseAdmin.from('status_history').insert({
      issue_id: id,
      old_status: currentIssue.status,
      new_status: 'assigned',
      changed_by: req.user.id,
      comment: `Assigned to ${worker.name}`
    });

    // Notify new worker
    await supabaseAdmin.from('notifications').insert({
      user_id: worker_id,
      title: 'New Issue Assigned',
      body: `You have been assigned issue: "${currentIssue.title}"`,
      type: 'assignment',
      issue_id: id
    });

    // Notify old worker if reassigned
    if (oldWorkerId && oldWorkerId !== worker_id) {
      await supabaseAdmin.from('notifications').insert({
        user_id: oldWorkerId,
        title: 'Issue Reassigned',
        body: `Issue "${currentIssue.title}" has been reassigned to another worker.`,
        type: 'assignment',
        issue_id: id
      });
    }

    // Notify submitter
    await supabaseAdmin.from('notifications').insert({
      user_id: currentIssue.submitted_by,
      title: 'Issue Assigned',
      body: `Your issue "${currentIssue.title}" has been assigned to ${worker.name}.`,
      type: 'status_change',
      issue_id: id
    });

    return successResponse(res, { issue }, `Issue assigned to ${worker.name} successfully.`);
  } catch (error) {
    console.error('Assign issue error:', error);
    return errorResponse(res, 'Server error assigning issue.');
  }
};

/**
 * PUT /api/issues/:id/close
 * Close a resolved issue (FM)
 */
const closeIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: currentIssue } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentIssue) {
      return errorResponse(res, 'Issue not found.', 404);
    }

    const { data: issue, error } = await supabaseAdmin
      .from('issues')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return errorResponse(res, 'Failed to close issue.', 500);
    }

    await supabaseAdmin.from('status_history').insert({
      issue_id: id,
      old_status: currentIssue.status,
      new_status: 'closed',
      changed_by: req.user.id,
      comment: 'Issue closed'
    });

    return successResponse(res, { issue }, 'Issue closed successfully.');
  } catch (error) {
    console.error('Close issue error:', error);
    return errorResponse(res, 'Server error closing issue.');
  }
};

/**
 * POST /api/issues/:id/comments
 * Add a comment to an issue
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    // Verify issue exists
    const { data: issue } = await supabaseAdmin
      .from('issues')
      .select('id, title, submitted_by, assigned_to')
      .eq('id', id)
      .single();

    if (!issue) {
      return errorResponse(res, 'Issue not found.', 404);
    }

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({
        issue_id: id,
        user_id: req.user.id,
        text
      })
      .select(`
        *,
        user:users!comments_user_id_fkey(id, name, role, profile_photo_url)
      `)
      .single();

    if (error) {
      return errorResponse(res, 'Failed to add comment.', 500);
    }

    // Notify relevant parties
    const notifyUsers = new Set();
    if (issue.submitted_by !== req.user.id) notifyUsers.add(issue.submitted_by);
    if (issue.assigned_to && issue.assigned_to !== req.user.id) notifyUsers.add(issue.assigned_to);

    for (const userId of notifyUsers) {
      await supabaseAdmin.from('notifications').insert({
        user_id: userId,
        title: 'New Comment',
        body: `${req.user.name} commented on issue "${issue.title}"`,
        type: 'comment',
        issue_id: id
      });
    }

    return successResponse(res, { comment }, 'Comment added successfully.', 201);
  } catch (error) {
    console.error('Add comment error:', error);
    return errorResponse(res, 'Server error adding comment.');
  }
};

/**
 * POST /api/issues/:id/photo
 * Upload a completion/resolution photo
 */
const uploadIssuePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const type = req.body.type || 'resolution';

    if (!req.file) {
      return errorResponse(res, 'No image file provided.', 400);
    }

    const { data: issue } = await supabaseAdmin
      .from('issues')
      .select('id, tracking_id')
      .eq('id', id)
      .single();

    if (!issue) {
      return errorResponse(res, 'Issue not found.', 404);
    }

    const fileName = `issues/${issue.tracking_id}/${type}-${Date.now()}-${req.file.originalname}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('issue-photos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (uploadError) {
      return errorResponse(res, 'Failed to upload photo.', 500);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('issue-photos')
      .getPublicUrl(fileName);

    const { data: photo, error } = await supabaseAdmin
      .from('issue_photos')
      .insert({
        issue_id: id,
        photo_url: publicUrl,
        type,
        uploaded_by: req.user.id
      })
      .select('*')
      .single();

    if (error) {
      return errorResponse(res, 'Failed to save photo record.', 500);
    }

    // If type is resolution, notify FM/Admin
    if (type === 'resolution') {
      const { data: managers } = await supabaseAdmin
        .from('users')
        .select('id')
        .in('role', ['facility_manager', 'admin'])
        .eq('status', 'active');

      if (managers) {
        for (const manager of managers) {
          await supabaseAdmin.from('notifications').insert({
            user_id: manager.id,
            title: '📸 Review Required',
            body: `Worker submitted a completion photo for issue "${issue.tracking_id}". Please review and approve.`,
            type: 'status_change',
            issue_id: id
          });
        }
      }
    }

    return successResponse(res, { photo }, 'Photo uploaded successfully.', 201);
  } catch (error) {
    console.error('Upload issue photo error:', error);
    return errorResponse(res, 'Server error uploading photo.');
  }
};

/**
 * DELETE /api/issues/:id
 * Delete an issue (FM / Admin)
 */
const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: issue, error: fetchError } = await supabaseAdmin
      .from('issues')
      .select('id, title')
      .eq('id', id)
      .single();

    if (fetchError || !issue) {
      return errorResponse(res, 'Issue not found.', 404);
    }

    const { error } = await supabaseAdmin
      .from('issues')
      .delete()
      .eq('id', id);

    if (error) {
      return errorResponse(res, 'Failed to delete issue.', 500);
    }

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      actor_id: req.user.id,
      action: 'delete_issue',
      target_type: 'issue',
      target_id: id,
      details: { title: issue.title }
    });

    return successResponse(res, null, 'Issue deleted successfully.');
  } catch (error) {
    console.error('Delete issue error:', error);
    return errorResponse(res, 'Server error deleting issue.');
  }
};

/**
 * GET /api/issues/stats
 * Get issue statistics (FM / Admin dashboard)
 */
const getIssueStats = async (req, res) => {
  try {
    // Total counts by status
    const statuses = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];
    const counts = {};

    for (const status of statuses) {
      const { count } = await supabaseAdmin
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      counts[status] = count || 0;
    }

    // Total issues
    const { count: total } = await supabaseAdmin
      .from('issues')
      .select('*', { count: 'exact', head: true });

    // Issues by category
    const { data: categoryStats } = await supabaseAdmin
      .from('issues')
      .select('category_id, category:categories(name)')
      .not('category_id', 'is', null);

    const categoryBreakdown = {};
    if (categoryStats) {
      categoryStats.forEach(item => {
        const name = item.category?.name || 'Unknown';
        categoryBreakdown[name] = (categoryBreakdown[name] || 0) + 1;
      });
    }

    return successResponse(res, {
      total: total || 0,
      byStatus: counts,
      byCategory: categoryBreakdown
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return errorResponse(res, 'Server error fetching statistics.');
  }
};

/**
 * GET /api/categories
 * Get all active categories
 */
const getCategories = async (req, res) => {
  try {
    const showArchived = req.query.include_archived === 'true';

    let query = supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (!showArchived) {
      query = query.eq('is_archived', false);
    }

    const { data: categories, error } = await query;

    if (error) {
      return errorResponse(res, 'Failed to fetch categories.', 500);
    }

    return successResponse(res, { categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse(res, 'Server error fetching categories.');
  }
};

module.exports = {
  createIssue,
  getAllIssues,
  getMyIssues,
  getAssignedIssues,
  getWorkerHistory,
  getIssueById,
  updateIssueStatus,
  assignIssue,
  closeIssue,
  addComment,
  uploadIssuePhoto,
  deleteIssue,
  getIssueStats,
  getCategories
};
