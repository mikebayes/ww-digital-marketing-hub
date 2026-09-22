/**
 * Run a .sql file against the Supabase database.
 *
 *   node scripts/db.mjs supabase/migrations/0001_intakes.sql
 *   node scripts/db.mjs --query "select count(*) from services"
 *
 * The project's direct database host (db.<ref>.supabase.co) resolves to IPv6
 * only, which many networks cannot reach, so this connects through the session
 * pooler instead. Session mode, not transaction mode: DDL and multi-statement
 * scripts need a real session.
 *
 * Reads SUPABASE_DB_PASSWORD and NEXT_PUBLIC_SUPABASE_URL from .env.local. The
 * password is never written to a tracked file and never logged.
 */

import { readFile } from "node:fs/promises";
import pg from "pg";

const REGION = "aws-0-ca-central-1";

async function loadEnv() {
  const env = {};
  try {
    const raw = await readFile(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match) env[match[1]] = match[2].trim();
    }
  } catch {
    // Fall through to process.env.
  }
  return { ...env, ...process.env };
}

function projectRef(url) {
  const match = /https:\/\/([a-z0-9]+)\.supabase\.co/.exec(url ?? "");
  if (!match) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing or malformed.");
  return match[1];
}

export async function connect() {
  const env = await loadEnv();
  const ref = projectRef(env.NEXT_PUBLIC_SUPABASE_URL);
  const password = env.SUPABASE_DB_PASSWORD;
  if (!password) {
    throw new Error("SUPABASE_DB_PASSWORD is not set in .env.local.");
  }

  const client = new pg.Client({
    host: `${REGION}.pooler.supabase.com`,
    port: 5432,
    user: `postgres.${ref}`,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000,
  });

  await client.connect();
  return client;
}

async function main() {
  const args = process.argv.slice(2);
  const client = await connect();

  try {
    if (args[0] === "--query") {
      const result = await client.query(args[1]);
      console.log(JSON.stringify(result.rows, null, 2));
      return;
    }

    const path = args[0];
    if (!path) throw new Error("Usage: node scripts/db.mjs <file.sql> | --query <sql>");

    const sql = await readFile(path, "utf8");

    /*
     * Sent as one statement rather than split on semicolons: the migration
     * contains a dollar-quoted function body, and naive splitting would cut it
     * in half. node-postgres uses the simple query protocol for a parameterless
     * query, which accepts multiple statements.
     */
    await client.query(sql);
    console.log(`applied: ${path}`);
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, "/") ||
    process.argv[1]?.endsWith("db.mjs")) {
  main().catch((error) => {
    console.error(`FAILED: ${error.message}`);
    process.exit(1);
  });
}
