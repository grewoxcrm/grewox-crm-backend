import express from "express";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import { createDocument, getDocuments, getDocumentById, updateDocument, deleteDocument } from "../controllers/documentController/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();


router.use(authenticateUser, checkRole,passCompanyDetails);

router.post('/', upload.single('file'), createDocument.validator, createDocument.handler);
router.get('/', getDocuments.validator, getDocuments.handler);
router.get('/:id', getDocumentById.validator, getDocumentById.handler);
router.put('/:id', upload.single('file'), updateDocument.validator, updateDocument.handler);
router.delete('/:id', deleteDocument.validator, deleteDocument.handler);

export default router;