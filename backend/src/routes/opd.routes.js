const express = require('express');
const { checkIn, getQueue, updateQueueStatus } = require('../controllers/opd.controller');
const authenticate = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { ROLES } = require('../constants/roles');

const router = express.Router();

// All OPD routes require authentication
router.use(authenticate);

/**
 * POST /api/opd/check-in
 * Check in a patient and create queue token with auto-assignment
 * Admin: can check-in any patient (provide patientUserId in body)
 * Patient: can self check-in (uses req.user._id)
 */
router.post('/check-in', checkIn);

/**
 * GET /api/opd/queue
 * Get queue tokens with filters
 * Query params: department, status, date
 * All authenticated users can view queue
 */
router.get('/queue', getQueue);

/**
 * PATCH /api/opd/:id/status
 * Update queue token status
 * Admin: can update any token
 * Faculty: can update tokens assigned to them
 * Student: can update tokens assigned to them
 * Patient: can cancel their own token (status='Cancelled')
 */
router.patch('/:id/status', updateQueueStatus);

module.exports = router;
