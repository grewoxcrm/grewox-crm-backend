import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createTraining, getAllTrainings, updateTraining, deleteTraining } from '../controllers/trainingController/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createTraining.validator, createTraining.handler);
router.get('/', getAllTrainings.validator, getAllTrainings.handler);
router.put('/:id', updateTraining.validator, updateTraining.handler);
router.delete('/:id', deleteTraining.validator, deleteTraining.handler);

export default router;