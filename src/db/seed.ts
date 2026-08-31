import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes("placeholder")) {
  console.error("DATABASE_URL is not set or invalid. Cannot run seeder.");
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle(sql, { schema });

async function main() {
  console.log("Seeding database...");

  const data = [
    {
      nama: "Ahmad Hidayat",
      telepon: "081299887766",
      dealer: "Toyota Astra Motor",
      status: 2, // Kirim Prospek Cepat
      spkUrl: "spk_ahmad_mock.pdf",
      buktiBayarUrl: "bukti_bayar_ahmad_mock.pdf",
    },
    {
      nama: "Siti Aminah",
      nik: "3171019876543210",
      tanggalLahir: "05-11-1992",
      telepon: "085711223344",
      statusPerkawinan: "Kawin",
      namaPasangan: "Muhammad Rofi",
      dealer: "Honda Prospect Motor",
      merkKendaraan: "Honda",
      modelKendaraan: "Vario 160",
      tipeKendaraan: "CBS",
      warnaKendaraan: "Matte Blue",
      hargaKendaraan: 26500000,
      asuransi: "Kombinasi",
      downPayment: 3500000,
      tenor: 23,
      angsuran: 1350000,
      status: 4, // Menunggu Approval
      spkUrl: "spk_siti_mock.pdf",
      buktiBayarUrl: "bukti_bayar_siti_mock.pdf",
      ktpUrl: "ktp_siti_mock.png",
      kkUrl: "kk_siti_mock.png",
    },
    {
      nama: "Rian Pratama",
      nik: "3171028765432109",
      tanggalLahir: "22-04-1995",
      telepon: "089988776655",
      statusPerkawinan: "Belum Kawin",
      dealer: "Yamaha Motor Dealer",
      merkKendaraan: "Yamaha",
      modelKendaraan: "NMAX 155",
      tipeKendaraan: "Connected",
      warnaKendaraan: "Matte Black",
      hargaKendaraan: 32500000,
      asuransi: "All Risk",
      downPayment: 5000000,
      tenor: 35,
      angsuran: 1250000,
      status: 9, // Dana Cair (Selesai)
      spkUrl: "spk_rian_mock.pdf",
      buktiBayarUrl: "bukti_bayar_rian_mock.pdf",
      ktpUrl: "ktp_rian_mock.png",
      kkUrl: "kk_rian_mock.png",
      ttdKonsumen: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      ttdMarketing: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      ttdDealer: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    },
  ];

  for (const item of data) {
    await db.insert(schema.submissions).values(item);
  }

  console.log("Seeding complete successfully!");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
