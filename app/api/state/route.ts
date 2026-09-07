import { readCompanionState, writeCompanionState } from '@/db/state-store';

export const dynamic = 'force-dynamic';

function userIdFrom(request: Request) {
  return request.headers.get('oai-authenticated-user-id');
}

function json(body: unknown, init?: ResponseInit) {
  const response = Response.json(body, init);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function GET(request: Request) {
  const userId = userIdFrom(request);
  if (!userId) return json({ error: 'Authentication required' }, { status: 401 });

  const saved = await readCompanionState(userId);
  if (!saved) return json({ state: null, revision: 0, updatedAt: null });

  return json({
    state: JSON.parse(saved.state_json),
    revision: saved.revision,
    updatedAt: saved.updated_at,
  });
}

export async function PUT(request: Request) {
  const userId = userIdFrom(request);
  if (!userId) return json({ error: 'Authentication required' }, { status: 401 });

  const body = await request.json().catch(() => null) as { state?: unknown } | null;
  if (!body || typeof body.state !== 'object' || body.state === null || Array.isArray(body.state)) {
    return json({ error: 'Invalid state' }, { status: 400 });
  }

  const stateJson = JSON.stringify(body.state);
  if (stateJson.length > 64_000) return json({ error: 'State is too large' }, { status: 413 });

  const updatedAt = await writeCompanionState(userId, stateJson);
  return json({ saved: true, updatedAt });
}
