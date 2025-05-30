import express from "express";
import { createFollowupCall, getAllfollowupcalls, getfollowupcalls } from "../controllers/followupcallComtrollers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

// Create followup meeting
router.post('/:id', createFollowupCall.validator, createFollowupCall.handler);

// Get all followup meetings
router.get('/:id', getAllfollowupcalls.validator, getAllfollowupcalls.handler);

// Get all followup calls for a specific deal
router.get('/', getfollowupcalls.validator, getfollowupcalls.handler);

// Update followup meeting  
// router.put('/:id', updateFollowupMeeting.validator, updateFollowupMeeting.handler);

// Delete followup meeting
// router.delete('/:id', deleteFollowupMeeting.validator, deleteFollowupMeeting.handler);

export default router;
