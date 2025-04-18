import express from "express";
import { createBranch, getAllBranch, updateBranch, deleteBranch } from "../controllers/branchControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetail from "../middlewares/passCompanyDetail.js";

const router = express.Router();

router.use(authenticateUser, checkRole,passCompanyDetail);

router.post('/', createBranch.validator, createBranch.handler);
router.get('/', getAllBranch.validator, getAllBranch.handler);
router.put('/:id', updateBranch.validator, updateBranch.handler);
router.delete('/:id', deleteBranch.validator, deleteBranch.handler);

export default router;
