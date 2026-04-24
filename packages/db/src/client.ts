import {drizzle} from "drizzle-orm/postgres-js";
import * as schema from "./schemas/index.js";
import postgres from "postgres";


const client = postgres(process.env.DATABASE_URL, {
    prepare: false,
});

export const db = drizzle(client, { schema });