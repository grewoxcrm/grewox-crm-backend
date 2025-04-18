import express from "express";
import { createProducts, getAllProducts, updateProducts, deleteProducts, getallproduct } from "../controllers/productsControllers/index.js";
import { authenticateUser, checkRole } from "../middlewares/index.js";
import upload from "../middlewares/upload.js";
import passCompanyDetails from '../middlewares/passCompanyDetail.js';
const router = express.Router();

router.use(authenticateUser, checkRole, passCompanyDetails);

router.post("/:id", upload.single('image'), createProducts.validator, createProducts.handler);
router.get("/:id", getAllProducts.validator, getAllProducts.handler);
router.put("/:id", upload.single('image'), updateProducts.validator, updateProducts.handler);
router.delete("/:id", deleteProducts.validator, deleteProducts.handler);
router.get("/", getallproduct.validator, getallproduct.handler);


export default router;

