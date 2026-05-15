const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * POST /api/auth/register
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role, employee_id } = req.body;

    // Check if email already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists.', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Determine initial status
    let status = 'active';
    if (role === 'facility_manager') {
      status = 'pending_approval'; // Requires admin approval
    }

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        name,
        email,
        password_hash,
        role,
        status,
        employee_id: employee_id || null
      })
      .select('id, name, email, role, status, created_at')
      .single();

    if (error) {
      console.error('Registration error:', error);
      return errorResponse(res, 'Failed to create account. Please try again.', 500);
    }

    // Generate JWT token (only if active)
    let token = null;
    if (status === 'active') {
      token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
    }

    return successResponse(res, {
      user: newUser,
      token
    }, status === 'pending_approval'
      ? 'Registration submitted. Awaiting admin approval.'
      : 'Registration successful!',
      201
    );

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Server error during registration.');
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    // Check if account is active
    if (user.status === 'inactive') {
      return errorResponse(res, 'Your account has been deactivated. Contact an administrator.', 403);
    }

    if (user.status === 'pending_approval') {
      return errorResponse(res, 'Your account is pending admin approval.', 403);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Log login in audit trail
    await supabaseAdmin.from('audit_log').insert({
      actor_id: user.id,
      action: 'login',
      target_type: 'user',
      target_id: user.id,
      details: { email: user.email, role: user.role }
    });

    return successResponse(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        availability: user.availability,
        profile_photo_url: user.profile_photo_url,
        created_at: user.created_at
      },
      token
    }, 'Login successful!');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Server error during login.');
  }
};

/**
 * POST /api/auth/logout
 * Invalidate session (client-side token removal)
 */
const logout = async (req, res) => {
  try {
    // Log logout in audit trail
    await supabaseAdmin.from('audit_log').insert({
      actor_id: req.user.id,
      action: 'logout',
      target_type: 'user',
      target_id: req.user.id
    });

    return successResponse(res, null, 'Logged out successfully.');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Server error during logout.');
  }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
const getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, status, availability, profile_photo_url, employee_id, created_at, updated_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return errorResponse(res, 'User not found.', 404);
    }

    return successResponse(res, { user });
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Server error fetching profile.');
  }
};

/**
 * PUT /api/auth/profile
 * Update current user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, availability } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (availability) updates.availability = availability;
    updates.updated_at = new Date().toISOString();

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, role, status, availability, profile_photo_url, updated_at')
      .single();

    if (error) {
      return errorResponse(res, 'Failed to update profile.', 500);
    }

    return successResponse(res, { user }, 'Profile updated successfully.');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Server error updating profile.');
  }
};

/**
 * PUT /api/auth/profile-photo
 * Upload profile photo
 */
const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file provided.', 400);
    }

    const fileName = `profiles/${req.user.id}/${Date.now()}-${req.file.originalname}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('issue-photos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return errorResponse(res, 'Failed to upload photo.', 500);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('issue-photos')
      .getPublicUrl(fileName);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ profile_photo_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select('id, name, email, profile_photo_url')
      .single();

    if (error) {
      return errorResponse(res, 'Failed to update profile photo.', 500);
    }

    return successResponse(res, { user }, 'Profile photo updated successfully.');
  } catch (error) {
    console.error('Update profile photo error:', error);
    return errorResponse(res, 'Server error uploading photo.');
  }
};

module.exports = { register, login, logout, getProfile, updateProfile, updateProfilePhoto };
