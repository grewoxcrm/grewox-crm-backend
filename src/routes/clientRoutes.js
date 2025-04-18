import express from "express";
import { getAllClients, updateClient, deleteClient, createClient, updatemail, getClientStorageController } from "../controllers/clientControllers/index.js";
import { authenticateUser, checkRole, checkUserRole } from "../middlewares/index.js";
import upload from "../middlewares/upload.js";
import cascadeDelete from "../middlewares/cascadeDelete.js";

const router = express.Router();

router.use(authenticateUser, checkRole);

router.get('/storage', getClientStorageController.handler);

router.put('/:id',
    upload.fields([
        { name: 'profilePic', maxCount: 1 },
        { name: 'e_signatures', maxCount: 1 }
    ]),
    updateClient.validator,
    updateClient.handler
);

router.put('/email/:id', updatemail.validator, updatemail.handler);

router.get('/', getAllClients.validator, getAllClients.handler);

router.use(authenticateUser, checkUserRole(['super-admin']));

router.post('/', createClient.validator, createClient.handler);

router.delete('/:id', cascadeDelete, deleteClient.validator, deleteClient.handler);


export default router;