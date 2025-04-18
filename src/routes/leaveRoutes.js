import express from 'express';
import { authenticateUser, checkRole, checkUserRole } from '../middlewares/index.js';
import { createLeave, getAllLeaves, getLeaveById, updateLeave, deleteLeave, approveLeave } from '../controllers/leaveController/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.put('/approve/:id', authenticateUser, checkUserRole(['client']), approveLeave.validator, approveLeave.handler);


router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createLeave.validator, createLeave.handler);
router.get('/', getAllLeaves.validator, getAllLeaves.handler);
router.get('/:id', getLeaveById.validator, getLeaveById.handler);
router.put('/:id', updateLeave.validator, updateLeave.handler);
router.delete('/:id', deleteLeave.validator, deleteLeave.handler);

export default router;