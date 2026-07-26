import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

let schemaReady;

// Creates tables on first use. Safe to call repeatedly — cached after the
// first successful run so it only actually hits the database once per
// warm serverless instance.
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS cases (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          data JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS cases_user_id_idx ON cases(user_id)`;
    })();
  }
  return schemaReady;
}

export async function createUser(email, passwordHash) {
  await ensureSchema();
  const id = randomUUID();
  await sql`
    INSERT INTO users (id, email, password_hash)
    VALUES (${id}, ${email}, ${passwordHash})
  `;
  return { id, email };
}

export async function getUserByEmail(email) {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM users WHERE email = ${email}`;
  return rows[0] || null;
}

export async function listCasesForUser(userId) {
  await ensureSchema();
  const { rows } = await sql`
    SELECT id, data FROM cases
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;
  return rows.map((r) => ({ ...r.data, id: r.id }));
}

export async function getCaseForUser(userId, caseId) {
  await ensureSchema();
  const { rows } = await sql`
    SELECT id, data FROM cases
    WHERE user_id = ${userId} AND id = ${caseId}
  `;
  if (!rows[0]) return null;
  return { ...rows[0].data, id: rows[0].id };
}

export async function upsertCaseForUser(userId, caseId, data) {
  await ensureSchema();
  const json = JSON.stringify(data);
  await sql`
    INSERT INTO cases (id, user_id, data, updated_at)
    VALUES (${caseId}, ${userId}, ${json}::jsonb, now())
    ON CONFLICT (id) DO UPDATE
    SET data = ${json}::jsonb, updated_at = now()
    WHERE cases.user_id = ${userId}
  `;
}

export async function deleteCaseForUser(userId, caseId) {
  await ensureSchema();
  await sql`DELETE FROM cases WHERE id = ${caseId} AND user_id = ${userId}`;
}
