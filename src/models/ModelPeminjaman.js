import { DataTypes } from "sequelize";
import db from "../configs/database.js";
import ModelBarang from "./ModelBarang.js";

const ModelPeminjaman = db.define(
  "peminjaman",
  {
    uuid: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    nama_peminjam: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    barang_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    tanggal_pinjam: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tanggal_kembali_direncanakan: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tanggal_kembali_actual: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("dipinjam", "dikembalikan", "hilang"),
      defaultValue: "dipinjam",
    },
    kondisi_kembali: {
      type: DataTypes.ENUM("baik", "rusak ringan", "rusak berat"),
      allowNull: true,
    },
    denda: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

ModelPeminjaman.belongsTo(ModelBarang, {
  foreignKey: "barang_id",
  as: "barang",
  onDelete: "cascade",
  onUpdate: "cascade",
});

export default ModelPeminjaman;