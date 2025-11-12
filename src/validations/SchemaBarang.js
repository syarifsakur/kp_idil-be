import { z } from "zod";

export const schemaCreateBarang = z.object({
  kategori: z.string().min(2, "Kategori minimal 2 karakter"),
  kondisi: z.enum(["baik", "rusak ringan", "rusak berat"]),
});

export const schemaUpdateBarang= z.object({
  nama_barang: z.string().min(3).optional(),
  kategori: z.string().min(2).optional(),
  kondisi: z.enum(["baik", "rusak ringan", "rusak berat"]),
});