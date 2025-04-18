import express from "express";
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee} from "../controllers/employeeControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { getActiveSubscription } from "../middlewares/checkSubscriptionLimits.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from "../middlewares/passCompanyDetail.js";

const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post('/', getActiveSubscription, createEmployee.validator, createEmployee.handler);
router.get('/', getAllEmployees.validator, getAllEmployees.handler);
router.put('/:id', upload.fields([
    { name: 'profilePic', maxCount: 1 },
    // { name: 'e_signature', maxCount: 1 }
    { name: 'cv', maxCount: 1 }
]), updateEmployee.validator, updateEmployee.handler);
router.delete('/:id', deleteEmployee.validator, deleteEmployee.handler);



export default router;