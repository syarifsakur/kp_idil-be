import { DataTypes } from "sequelize";
import db from "../configs/database.js";

const ModelBarang = db.define(
  "barang",
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
    nama_barang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stok: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    kondisi: {
      type: DataTypes.ENUM("baik", "rusak ringan", "rusak berat"),
      defaultValue: "baik",
    },
    img:{
        type: DataTypes.STRING,
    },
    path_img:{
        type: DataTypes.STRING,
    }
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export default ModelBarang;