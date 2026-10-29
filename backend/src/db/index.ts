// Purpose: Create and export the PostgreSQL connection and Drizzle query interface.
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ENV } from "@/config/env";
import * as schema from "./schema";

// Meaning: Stop startup with a clear error if the database connection string is missing.
if (!ENV.DATABASE_URL) throw new Error("DATABASE_URL is required");

// Purpose: Open a reusable pool of PostgreSQL connections using the configured URL.
export const pool = new Pool({ connectionString: ENV.DATABASE_URL });

// Purpose: Let application code query the database using Drizzle and the table definitions.
export const db = drizzle({ client: pool, schema });