import { Router } from "express";
import { createDeal, deleteDeal, getAllDeal, updateDeal, getDealById, addDealFiles, deleteDealFiles } from "../controllers/dealControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
import upload from "../middlewares/upload.js";
const router = Router();

router.use(authenticateUser, checkRole, passCompanyDetails);


router.post("/", createDeal.validator, createDeal.handler);
router.get("/", getAllDeal.validator, getAllDeal.handler);
router.get("/:id", getDealById.validator, getDealById.handler);
router.put("/:id", upload.fields([{ name: 'deal_files', maxCount: 1 }]), updateDeal.validator, updateDeal.handler);
router.delete("/:id", deleteDeal.validator, deleteDeal.handler);

router.post('/files/:id', upload.fields([{ name: 'deal_files', maxCount: 1 }]), addDealFiles.validator, addDealFiles.handler);
router.delete('/files/:id', deleteDealFiles.validator, deleteDealFiles.handler);



export default router;