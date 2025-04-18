import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createCustomForm, getAllCustomForm, updateCustomForm, deleteCustomForm, getCustomFormById } from "../controllers/customFormController/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

// Protected routes for form management
router.post("/", createCustomForm.validator, createCustomForm.handler);
router.get("/", getAllCustomForm.validator, getAllCustomForm.handler);
router.get("/:id", getCustomFormById.validator, getCustomFormById.handler);
router.put("/:id", updateCustomForm.validator, updateCustomForm.handler);
router.delete("/:id", deleteCustomForm.validator, deleteCustomForm.handler);

export default router;
