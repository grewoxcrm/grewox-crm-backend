import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../controllers/contactController/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/", createContact.validator, createContact.handler);   
router.get("/", getAllContacts.validator, getAllContacts.handler);
router.get("/:id", getContactById.validator, getContactById.handler);
router.put("/:id", updateContact.validator, updateContact.handler);
router.delete("/:id", deleteContact.validator, deleteContact.handler);

export default router;
