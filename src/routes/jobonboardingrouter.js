import { Router } from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createjobonboarding, getjobonboarding, updatejobonboarding, deletejobonboarding, getjobonboardingbyid } from "../controllers/jobonboarding/index.js"
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = Router();
router.use(authenticateUser, checkRole, passCompanyDetails);
router.post("/", createjobonboarding.validator, createjobonboarding.handler);
router.get("/", getjobonboarding.validator, getjobonboarding.handler);
router.get("/:id", getjobonboardingbyid.validator, getjobonboardingbyid.handler);
router.put("/:id", updatejobonboarding.validator, updatejobonboarding.handler);
router.delete("/:id", deletejobonboarding.validator, deletejobonboarding.handler);

export default router;

