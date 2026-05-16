const { supabaseAdmin } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * GET /api/manager/workers
 * List all worker accounts with their workload
 */
const getWorkers = async (req, res) => {
  try {
    const { data: workers, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, status, availability, profile_photo_url, created_at')
      .eq('role', 'worker')
      .order('name', { ascending: true });

    if (error) {
      return errorResponse(res, 'Failed to fetch workers.', 500);
    }

    // Get active issue counts for each worker
    const workersWithLoad = await Promise.all(
      workers.map(async (worker) => {
        const { count } = await supabaseAdmin
          .from('issues')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to', worker.id)
          .in('status', ['assigned', 'in_progress']);

        return { ...worker, active_issues: count || 0 };
      })
    );

    return successResponse(res, { workers: workersWithLoad });
  } catch (error) {
    console.error('Get workers error:', error);
    return errorResponse(res, 'Server error fetching workers.');
  }
};

/**
 * PUT /api/manager/workers/:id/status
 * Activate or deactivate a worker account
 */
const updateWorkerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return errorResponse(res, 'Invalid status. Must be "active" or "inactive".', 400);
    }

    const { data: worker, error } = await supabaseAdmin
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('role', 'worker')
      .select('id, name, email, status')
      .single();

    if (error || !worker) {
      return errorResponse(res, 'Worker not found.', 404);
    }

    // Audit log
    await supabaseAdmin.from('audit_log').insert({
      actor_id: req.user.id,
      action: `worker_${status === 'active' ? 'activated' : 'deactivated'}`,
      target_type: 'user',
      target_id: id,
      details: { worker_name: worker.name }
    });

    return successResponse(res, { worker }, `Worker ${status === 'active' ? 'activated' : 'deactivated'} successfully.`);
  } catch (error) {
    console.error('Update worker status error:', error);
    return errorResponse(res, 'Server error updating worker status.');
  }
};

module.exports = { getWorkers, updateWorkerStatus };
