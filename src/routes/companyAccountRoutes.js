import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createCompanyAccount, getAllCompanyAccount, updateCompanyAccount, deleteCompanyAccount } from "../controllers/companyAccountController/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

// Create company account
router.post("/", createCompanyAccount.validator, createCompanyAccount.handler);
router.get("/", getAllCompanyAccount.validator, getAllCompanyAccount.handler);
router.put("/:id", updateCompanyAccount.validator, updateCompanyAccount.handler);
router.delete("/:id", deleteCompanyAccount.validator, deleteCompanyAccount.handler);

export default router; 