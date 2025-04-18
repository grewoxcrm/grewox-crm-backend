

import { Router } from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createSetting, getAllSetting , deleteSetting } from "../controllers/settingControllers/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", upload.fields([{ name: 'companylogo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]), createSetting.validator, createSetting.handler);
router.get("/", getAllSetting.validator, getAllSetting.handler);
router.delete("/:id", deleteSetting.validator, deleteSetting.handler);

export default router;