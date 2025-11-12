import { z } from "zod";


export const returnBarangSchema = z.object({
  kondisi_kembali: z.enum(["baik", "rusak ringan", "rusak berat"]),
});