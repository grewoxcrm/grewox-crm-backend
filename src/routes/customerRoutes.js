import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createCustomer.validator, createCustomer.handler);
router.get("/", getCustomers.validator, getCustomers.handler);
router.get("/:id", getCustomerById.validator, getCustomerById.handler);
router.put("/:id", updateCustomer.validator, updateCustomer.handler);
router.delete("/:id", deleteCustomer.validator, deleteCustomer.handler);

export default router;
