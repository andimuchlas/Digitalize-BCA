import { defineConfig } from "drizzle-kit";
import fs from "fs";
import path from "path";

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
      if (match) {
        databaseUrl = match[1];
      }
    }
  } catch (e) {
    console.error("Failed to load .env.local in drizzle config:", e);
  }
}

export default defineConfig({
  schema: "./src/db/schema/submissions.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl || "postgres://localhost/placeholder",
  },
});
