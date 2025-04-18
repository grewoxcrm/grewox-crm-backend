import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { getAllVendor, createVendor, updateVendor, deleteVendor } from "../controllers/vendorControllers/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', createVendor.validator, createVendor.handler);
router.get('/', getAllVendor.validator, getAllVendor.handler);
// router.get('/:id', getVendorById.validator, getVendorById.handler);
router.put('/:id', updateVendor.validator, updateVendor.handler);
router.delete('/:id', deleteVendor.validator, deleteVendor.handler);


export default router;