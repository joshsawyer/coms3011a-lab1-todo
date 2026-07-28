import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type { AppDatabase } from "./client";

const MIGRATIONS_FOLDER = path.join(process.cwd(), "drizzle");

export function runMigrations(db: AppDatabase) {
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
}
