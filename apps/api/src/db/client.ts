import "dotenv/config"; // <-- MUST be first

import { createDb } from "@neuron/db";

const { d } = createDb(process.env.DATABASE_URL!);

console.log("DB initialized");

// start server here...