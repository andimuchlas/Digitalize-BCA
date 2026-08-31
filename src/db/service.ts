import { db } from "./index";
import { submissions, type Submission, type NewSubmission } from "./schema";
import { eq } from "drizzle-orm";

// Global in-memory fallback store for when Neon DB is not connected
let memorySubmissions: Submission[] = [];
let nextId = 1;

const isDbAvailable = () => {
  return process.env.DATABASE_URL && process.env.DATABASE_URL !== "postgres://localhost/placeholder";
};

export async function getSubmissions(): Promise<Submission[]> {
  if (isDbAvailable()) {
    try {
      return await db.select().from(submissions).orderBy(submissions.createdAt);
    } catch (e) {
      console.error("Failed to query database, falling back to memory store:", e);
    }
  }
  return memorySubmissions;
}

export async function getSubmissionById(id: number): Promise<Submission | undefined> {
  if (isDbAvailable()) {
    try {
      const results = await db.select().from(submissions).where(eq(submissions.id, id));
      return results[0];
    } catch (e) {
      console.error(`Failed to query database for id ${id}, falling back to memory store:`, e);
    }
  }
  return memorySubmissions.find((s) => s.id === id);
}

export async function createSubmission(data: NewSubmission): Promise<Submission> {
  if (isDbAvailable()) {
    try {
      const results = await db.insert(submissions).values(data).returning();
      return results[0];
    } catch (e) {
      console.error("Failed to insert into database, falling back to memory store:", e);
    }
  }

  // Fallback to memory
  const newSub: Submission = {
    id: nextId++,
    nama: data.nama,
    nik: data.nik || null,
    tanggalLahir: data.tanggalLahir || null,
    telepon: data.telepon,
    statusPerkawinan: data.statusPerkawinan || null,
    namaPasangan: data.namaPasangan || null,
    dealer: data.dealer,
    merkKendaraan: data.merkKendaraan || null,
    modelKendaraan: data.modelKendaraan || null,
    tipeKendaraan: data.tipeKendaraan || null,
    warnaKendaraan: data.warnaKendaraan || null,
    hargaKendaraan: data.hargaKendaraan || null,
    asuransi: data.asuransi || null,
    downPayment: data.downPayment || null,
    tenor: data.tenor || null,
    angsuran: data.angsuran || null,
    status: data.status ?? 1,
    spkUrl: data.spkUrl || null,
    buktiBayarUrl: data.buktiBayarUrl || null,
    ktpUrl: data.ktpUrl || null,
    kkUrl: data.kkUrl || null,
    ttdKonsumen: data.ttdKonsumen || null,
    ttdMarketing: data.ttdMarketing || null,
    ttdDealer: data.ttdDealer || null,
    createdAt: new Date(),
  };
  memorySubmissions.push(newSub);
  return newSub;
}

export async function updateSubmission(id: number, data: Partial<Submission>): Promise<Submission | undefined> {
  if (isDbAvailable()) {
    try {
      const results = await db
        .update(submissions)
        .set(data)
        .where(eq(submissions.id, id))
        .returning();
      return results[0];
    } catch (e) {
      console.error(`Failed to update database for id ${id}, falling back to memory store:`, e);
    }
  }

  // Fallback to memory
  const index = memorySubmissions.findIndex((s) => s.id === id);
  if (index !== -1) {
    const updated = {
      ...memorySubmissions[index],
      ...data,
    } as Submission;
    memorySubmissions[index] = updated;
    return updated;
  }
  return undefined;
}

export async function deleteSubmission(id: number): Promise<boolean> {
  if (isDbAvailable()) {
    try {
      await db.delete(submissions).where(eq(submissions.id, id));
      return true;
    } catch (e) {
      console.error(`Failed to delete from database for id ${id}, falling back to memory store:`, e);
    }
  }

  const index = memorySubmissions.findIndex((s) => s.id === id);
  if (index !== -1) {
    memorySubmissions.splice(index, 1);
    return true;
  }
  return false;
}
