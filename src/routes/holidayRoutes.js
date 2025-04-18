import express from 'express';
import { authenticateUser, checkRole } from '../middlewares/index.js';
import { createHoliday, getAllHoliday, updateHoliday, deleteHoliday } from '../controllers/holidayControllers/index.js';
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createHoliday.validator, createHoliday.handler);
router.get('/', getAllHoliday.validator, getAllHoliday.handler);
router.put('/:id', updateHoliday.validator, updateHoliday.handler);
router.delete('/:id', deleteHoliday.validator, deleteHoliday.handler);

export default router;