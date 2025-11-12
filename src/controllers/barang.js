import ModelBarang from "../models/ModelBarang.js";
import path from "path";
import fs from "fs";

export const getBarang = async (req, res) => {
  try {
    const { rows: response, count: total } = await ModelBarang.findAndCountAll({
      attributes: [
        "uuid",
        "nama_barang",
        "kategori",
        "stok",
        "kondisi",
        "img",
        "path_img",
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.status(200).json({ response, total });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const getBarangById = async (req, res) => {
  try {
    const response = await ModelBarang.findByPk(req.params.id);
    if (!response) {
      return res.status(404).json({ message: "Barang not found" });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const createBarang = async (req, res) => {
  const { nama_barang, kategori, stok, kondisi } = req.body;

  if (!req.files) return res.status(422).json({ img: "Img harus di isi!" });

  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const allowedTypes = [".png", ".jpg", ".jpeg"];
  const filename = Date.now() + ext;

  if (!allowedTypes.includes(ext.toLowerCase()))
    return res.status(422).json({ img: "Format img tidak di dukung!" });
  if (fileSize > 30000000)
    return res.status(422).json({ img: "Ukuran img terlalu besar!" });

  const pathImg = `${req.protocol}://${req.get(
    "host"
  )}/public/barang/${filename}`;

  file.mv(`public/barang/${filename}`);
  try {
    const response = await ModelBarang.create({
      nama_barang,
      kategori,
      stok,
      kondisi,
      img: filename,
      path_img: pathImg,
    });
    return res
      .status(201)
      .json({ message: "Barang created successfully", data: response });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export const updateBarang = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_barang, kategori, stok, kondisi } = req.body;

    // 🔍 Cari barang berdasarkan ID
    const barang = await ModelBarang.findByPk(id);
    if (!barang) {
      return res
        .status(404)
        .json({ success: false, message: "Barang tidak ditemukan" });
    }

    // 🧩 Jika tidak ada file baru (update tanpa gambar)
    if (!req.files || !req.files.file) {
      await barang.update({ nama_barang, kategori, stok, kondisi });
      return res.status(200).json({
        success: true,
        message: "Barang berhasil diperbarui tanpa mengganti gambar",
      });
    }

    // 🖼 Jika ada file baru
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name).toLowerCase();
    const allowedTypes = [".png", ".jpg", ".jpeg"];

    if (!allowedTypes.includes(ext)) {
      return res
        .status(422)
        .json({
          success: false,
          message: "Format gambar tidak didukung (hanya JPG/PNG)",
        });
    }

    if (fileSize > 3 * 1024 * 1024) {
      // batas 3MB
      return res
        .status(422)
        .json({
          success: false,
          message: "Ukuran gambar terlalu besar (maks 3MB)",
        });
    }

    // 🧠 Buat nama file baru unik
    const filename = `${Date.now()}${ext}`;
    const savePath = `public/barang/${filename}`;
    const pathImg = `${req.protocol}://${req.get(
      "host"
    )}/public/barang/${filename}`;

    // 🔥 Hapus gambar lama kalau ada
    if (barang.img) {
      const oldPath = `public/barang/${barang.img}`;
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // 💾 Simpan file baru
    await file.mv(savePath);

    // 🧩 Update data barang
    await barang.update({
      nama_barang,
      kategori,
      stok,
      kondisi,
      img: filename,
      path_img: pathImg,
    });

    return res.status(200).json({
      success: true,
      message: "Barang berhasil diperbarui!",
      data: barang,
    });
  } catch (error) {
    console.error("Update Barang Error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

export const deleteBarang = async (req, res) => {
  const { id } = req.params;
  try {
    const barang = await ModelBarang.findByPk(id);
    if (!barang) {
      return res.status(404).json({ message: "Barang not found" });
    }

    if (barang.img) {
      fs.unlinkSync(`public/barang/${barang.img}`);
    }
    await barang.destroy();
    return res.status(200).json({ message: "Barang deleted successfully" });
  } catch (error) {
    return res.status(500).json(error);
  }
};
