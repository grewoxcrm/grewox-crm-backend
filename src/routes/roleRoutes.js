import express from 'express';
import { createRole, getAllRoles, updateRole, deleteRole, getRoleById } from '../controllers/roleController/index.js';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import passCompanyDetail from '../middlewares/passCompanyDetail.js';

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetail);

router.post('/', createRole.validator, createRole.handler);
router.get('/', getAllRoles.validator, getAllRoles.handler);
router.get('/:id', getRoleById.validator, getRoleById.handler);
router.put('/:id', updateRole.validator, updateRole.handler);
router.delete('/:id', deleteRole.validator, deleteRole.handler);

export default router;
