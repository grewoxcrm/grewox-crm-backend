import express from "express";
import { createDesignation, getAllDesignations, getDesignationById, updateDesignation, deleteDesignation } from "../controllers/designationControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole,passCompanyDetails);

router.post("/", createDesignation.validator, createDesignation.handler);
router.get("/", getAllDesignations.validator, getAllDesignations.handler);
router.get("/:id", getDesignationById.validator, getDesignationById.handler);
router.put("/:id", updateDesignation.validator, updateDesignation.handler);
router.delete("/:id", deleteDesignation.validator, deleteDesignation.handler);

export default router;