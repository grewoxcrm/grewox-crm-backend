import express from 'express';
import { createSalary, getAllSalary, getSalaryById, updateSalary, deleteSalary } from '../controllers/salaryController/index.js';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();


router.use(authenticateUser, checkRole, passCompanyDetails);
router.post('/', createSalary.validator, createSalary.handler);
router.get('/', getAllSalary.validator, getAllSalary.handler);
router.get('/:id', getSalaryById.validator, getSalaryById.handler);
router.put('/:id', updateSalary.validator, updateSalary.handler);
router.delete('/:id', deleteSalary.validator, deleteSalary.handler);

export default router;
