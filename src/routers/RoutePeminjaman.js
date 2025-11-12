import express from "express";
import {
  createPeminjaman,
  getRiwayatPeminjaman,
  getPeminjamanById,
  updateStatusPeminjaman,
  riwayat,
} from "../controllers/peminjaman.js";
import verifyToken from "../middlewares/VerifyToken.js";


const router = express.Router();

router.post("/create",verifyToken,createPeminjaman);
router.put("/update/:id",verifyToken, updateStatusPeminjaman);
router.get("/riwayat",verifyToken, riwayat);
router.get("/",verifyToken, getRiwayatPeminjaman);
router.get("/:id",verifyToken, getPeminjamanById);

export default router;
