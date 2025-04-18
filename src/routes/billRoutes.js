import express from "express";
import { createBill, getAllBill, getBillById, updateBill, deleteBill } from "../controllers/billControllers/index.js";
import downloadBill from "../controllers/billControllers/downloadBill.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";
const router = express.Router();


router.get('/download/:id', downloadBill.validator, downloadBill.handler);

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/:id', createBill.validator, createBill.handler);
router.get('/:id', getAllBill.validator, getAllBill.handler);
router.get('/:id', getBillById.validator, getBillById.handler);
router.put('/:id', updateBill.validator, updateBill.handler);
router.delete('/:id', deleteBill.validator, deleteBill.handler);

export default router;
