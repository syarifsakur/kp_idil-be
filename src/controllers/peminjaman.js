import { Op } from "sequelize";
import ModelPeminjaman from "../models/ModelPeminjaman.js";
import ModelBarang from "../models/ModelBarang.js";
import path from "path";

export const createPeminjaman = async (req, res) => {
  const {
    nama_peminjam,
    barang_id,
    jumlah,
    tanggal_pinjam,
    tanggal_kembali_direncanakan,
  } = req.body;

  if (!req.files) return res.status(422).json({ img: "Img harus di isi!" });

  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const allowedTypes = [".pdf"];
  const filename = Date.now() + ext;

  if (!allowedTypes.includes(ext.toLowerCase()))
    return res.status(422).json({ file: "Format File tidak di dukung!" });
  if (fileSize > 30000000)
    return res.status(422).json({ file: "Ukuran File terlalu besar!" });

  const pathFile = `${req.protocol}://${req.get(
    "host"
  )}/public/peminjaman/${filename}`;

  file.mv(`public/peminjaman/${filename}`);
  try {
    const barang = await ModelBarang.findByPk(barang_id);
    if (!barang) {
      return res.status(404).json({ message: "Barang not found" });
    }

    if (barang.stok < jumlah) {
      return res.status(400).json({ message: "Stok tidak mencukupi" });
    }

    const peminjaman = await ModelPeminjaman.create({
      nama_peminjam,
      barang_id,
      jumlah,
      tanggal_pinjam,
      tanggal_kembali_direncanakan,
      status: "dipinjam",
      file_peminjaman: filename,
      path_file_peminjaman: pathFile,
    });

    await barang.update({ stok: barang.stok - jumlah });

    return res
      .status(201)
      .json({ message: "Peminjaman created successfully", data: peminjaman });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error creating peminjaman", error: error.message });
  }
};

export const riwayat = async (req, res) => {
  try {
    const { rows: response, count: total } =
      await ModelPeminjaman.findAndCountAll({
        where: {
          status: {
            [Op.in]: ["dikembalikan", "hilang"],
          },
        },
        include: [
          {
            model: ModelBarang,
            as: "barang",
            attributes: ["uuid", "nama_barang", "kategori"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    return res.status(200).json({ response, total });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching riwayat", error: error.message });
  }
};

export const getRiwayatPeminjaman = async (req, res) => {
  try {
    const { rows: response, count: total } =
      await ModelPeminjaman.findAndCountAll({
        where: { status: "dipinjam" },
        attributes: [
          "uuid",
          "nama_peminjam",
          "jumlah",
          "tanggal_pinjam",
          "tanggal_kembali_direncanakan",
          "status",
          "file_peminjaman",
          "path_file_peminjaman",
        ],
        include: [
          {
            model: ModelBarang,
            as: "barang",
            attributes: ["uuid", "nama_barang", "kategori"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

    return res.status(200).json({ response, total });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching peminjaman", error: error.message });
  }
};

export const updateStatusPeminjaman = async (req, res) => {
  const { id } = req.params;
  const { status, kondisi_kembali } = req.body;

  const allowed = ["dipinjam", "hilang", "dikembalikan"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Status tidak valid." });
  }

  const peminjaman = await ModelPeminjaman.findOne({ where: { uuid: id } });
  if (!peminjaman) {
    return res
      .status(404)
      .json({ message: "Data peminjaman tidak ditemukan." });
  }

  // Jika dikembalikan stok barang dikembalikan
  if (status === "dikembalikan") {
    const barang = await ModelBarang.findByPk(peminjaman.barang_id);
    if (barang) {
      await barang.update({ stok: barang.stok + peminjaman.jumlah });
    }
  }

  try {
    await peminjaman.update({
      status,
      tanggal_kembali_actual: new Date(), // tanggal sekarang
      kondisi_kembali: kondisi_kembali || peminjaman.kondisi_kembali,
    });

    return res.status(200).json({
      message: "Status berhasil diperbarui.",
      data: peminjaman,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Gagal memperbarui status.", error: error.message });
  }
};

export const getPeminjamanById = async (req, res) => {
  const { uuid } = req.params;
  try {
    const peminjaman = await ModelPeminjaman.findByPk(uuid, {
      include: [
        {
          model: ModelBarang,
          as: "barang",
          attributes: ["uuid", "nama_barang", "kategori"],
        },
      ],
    });
    if (!peminjaman) {
      return res.status(404).json({ message: "Peminjaman not found" });
    }
    return res.status(200).json(peminjaman);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching peminjaman", error: error.message });
  }
};
