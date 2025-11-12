import express from "express";
import {
  getBarang,
  getBarangById,
  createBarang,
  updateBarang,
  deleteBarang,
} from "../controllers/barang.js";
import validateData from "../middlewares/validation.js";
import verifyToken from "../middlewares/VerifyToken.js";
import {
  schemaCreateBarang,
  schemaUpdateBarang,
} from "../validations/SchemaBarang.js";

const router = express.Router();

router.get("/", verifyToken, getBarang);
router.get("/:id", verifyToken, getBarangById);
router.delete("/delete/:id", verifyToken, deleteBarang);
router.post(
  "/create",
  verifyToken,
  validateData(schemaCreateBarang),
  createBarang
);
router.put(
  "/update/:id",
  verifyToken,
  validateData(schemaUpdateBarang),
  updateBarang
);

export default router;
