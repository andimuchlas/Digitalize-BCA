import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  nik: text("nik"),
  tanggalLahir: text("tanggal_lahir"),
  telepon: text("telepon").notNull(),
  statusPerkawinan: text("status_perkawinan"),
  namaPasangan: text("nama_pasangan"),
  
  dealer: text("dealer").notNull(),
  merkKendaraan: text("merk_kendaraan"),
  modelKendaraan: text("model_kendaraan"),
  tipeKendaraan: text("tipe_kendaraan"),
  warnaKendaraan: text("warna_kendaraan"),
  hargaKendaraan: integer("harga_kendaraan"),
  
  asuransi: text("asuransi"),
  downPayment: integer("down_payment"),
  tenor: integer("tenor"), // bulan
  angsuran: integer("angsuran"), // per bulan
  
  status: integer("status").default(1).notNull(), // 1 sampai 9
  
  spkUrl: text("spk_url"),
  buktiBayarUrl: text("bukti_bayar_url"),
  ktpUrl: text("ktp_url"),
  kkUrl: text("kk_url"),
  
  ttdKonsumen: text("ttd_konsumen"), // Base64 Data URL
  ttdMarketing: text("ttd_marketing"), // Base64 Data URL
  ttdDealer: text("ttd_dealer"), // Base64 Data URL
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
