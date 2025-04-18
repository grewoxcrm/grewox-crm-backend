import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createofferletter, getofferletter, getofferletterbyid, updateofferletter, deleteofferletter } from "../controllers/offerletter/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", upload.single('file'), createofferletter.validator, createofferletter.handler);
router.get("/", getofferletter.validator, getofferletter.handler);
router.get("/:id", getofferletterbyid.validator, getofferletterbyid.handler);
router.put("/:id", upload.single('file'), updateofferletter.validator, updateofferletter.handler);
router.delete("/:id", deleteofferletter.validator, deleteofferletter.handler);

export default router;