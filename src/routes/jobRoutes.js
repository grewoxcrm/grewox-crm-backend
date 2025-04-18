import express from "express";
import { createJob, getAllJobs, getJobById, updateJob, deleteJob } from "../controllers/jobController/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createJob.validator, createJob.handler);
router.get('/', getAllJobs.validator, getAllJobs.handler);
router.get('/:id', getJobById.validator, getJobById.handler);
router.put('/:id', updateJob.validator, updateJob.handler);
router.delete('/:id', deleteJob.validator, deleteJob.handler);

export default router;