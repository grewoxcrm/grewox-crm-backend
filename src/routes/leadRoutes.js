import express from "express";
import { createLead, getAllLeads, getLeadById, updateLead, deleteLead, addLeadMembers, addLeadFiles, deleteLeadMembers, deleteLeadFiles } from "../controllers/leadController/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

// Lead Routes start ==============================
router.post('/', createLead.validator, createLead.handler);
router.get('/', getAllLeads.validator, getAllLeads.handler);
router.get('/:id', getLeadById.validator, getLeadById.handler);
router.put('/:id', updateLead.validator, updateLead.handler);
router.delete('/:id', deleteLead.validator, deleteLead.handler);

router.post('/membersadd/:id', addLeadMembers.validator, addLeadMembers.handler);
router.post('/membersdel/:id', deleteLeadMembers.validator, deleteLeadMembers.handler);

router.post('/files/:id', upload.fields([{ name: 'lead_files', maxCount: 1 }]), addLeadFiles.validator, addLeadFiles.handler);
router.delete('/files/:id', deleteLeadFiles.validator, deleteLeadFiles.handler);

// router.post('/note/:id', leadNote.validator, leadNote.handler);

export default router;