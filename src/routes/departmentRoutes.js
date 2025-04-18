import express from "express";
import { createDepartment, getAllDepartments, getDepartmentById, updateDepartment, deleteDepartment } from "../controllers/departmentControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole,passCompanyDetails);

router.post("/", createDepartment.validator, createDepartment.handler);
router.get("/", getAllDepartments.validator, getAllDepartments.handler);
router.get("/:id", getDepartmentById.validator, getDepartmentById.handler);
router.put("/:id", updateDepartment.validator, updateDepartment.handler);
router.delete("/:id", deleteDepartment.validator, deleteDepartment.handler);

export default router;