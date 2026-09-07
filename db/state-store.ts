import { env } from 'cloudflare:workers';

type StoredState = {
  state_json: string;
  revision: number;
  updated_at: number;
};

function getDatabase() {
  const database = (env as unknown as { DB?: D1Database }).DB;
  if (!database) throw new Error('DB binding is unavailable');
  return database;
}

export async function readCompanionState(userId: string) {
  return getDatabase()
    .prepare('SELECT state_json, revision, updated_at FROM companion_states WHERE user_id = ?')
    .bind(userId)
    .first<StoredState>();
}

export async function writeCompanionState(userId: string, stateJson: string) {
  const updatedAt = Date.now();
  await getDatabase()
    .prepare(`
      INSERT INTO companion_states (user_id, state_json, revision, updated_at)
      VALUES (?, ?, 1, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        state_json = excluded.state_json,
        revision = companion_states.revision + 1,
        updated_at = excluded.updated_at
    `)
    .bind(userId, stateJson, updatedAt)
    .run();

  return updatedAt;
}
