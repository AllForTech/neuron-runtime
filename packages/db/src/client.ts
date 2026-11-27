import {drizzle} from "drizzle-orm/postgres-js";
import * as schema from "./schemas/index.js";
import postgres from "postgres";


const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
}

const client = postgres(databaseUrl, {
    prepare: false,
});

export const db = drizzle(client, { schema });