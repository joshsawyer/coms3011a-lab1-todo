import { createDb } from "../src/lib/db/client";
import { runMigrations } from "../src/lib/db/migrate";

const db = createDb();
runMigrations(db);
console.log("Database migrated: data/app.db");
