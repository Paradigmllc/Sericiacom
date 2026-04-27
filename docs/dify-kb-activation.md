#### 📋 目次

| # | セクション |
|---|-----------|
| 1 | [What this activates](#dify-1) |
| 2 | [Step 1 — create the dataset in Dify](#dify-2) |
| 3 | [Step 2 — set Coolify env vars](#dify-3) |
| 4 | [Step 3 — first sync (dryRun)](#dify-4) |
| 5 | [Step 4 — flip n8n cron to active](#dify-5) |
| 6 | [Verification + rollback](#dify-6) |

---

# Dify Knowledge Base activation

The F13 plumbing is live (`/api/dify-kb-sync` endpoint + n8n daily
workflow). It currently returns **HTTP 503 `dify_kb_not_configured`**
because two env vars aren't set yet. This runbook walks the
~10-minute manual flip.

<a id="dify-1"></a>

## 1. What this activates

Once configured, the existing n8n workflow `dify-kb-sync.json` runs
nightly at 03:00 JST and pushes:

- All static `lib/journal.ts` articles (currently ~13)
- Every Payload-published `articles` collection entry, including
  pSEO-generated articles (currently ~7, growing nightly via the
  pSEO drain workflow)

into a Dify Knowledge Base. The chat assistant at `/api/dify-chat`
already subscribes to that KB via Dify's chat-app config — once
documents land, every chat answer is grounded in the same content
visitors read on `/journal`.

**Closed-loop net effect**: Sericia's content engine becomes
self-feeding. pSEO writes article → published to /articles → synced
to Dify nightly → chatbot answers next visitor's question with that
exact article as citation. The chatbot stops sounding generic.

<a id="dify-2"></a>

## 2. Step 1 — create the dataset in Dify

1. Sign in to Dify (the same workspace that hosts the existing chat
   app — the app token starts with `app-WnX...`).
2. Knowledge → New Knowledge → "Create from Empty"
3. Settings:
   - Name: `Sericia Editorial Canon`
   - Description: `Static journal + Payload-generated pSEO articles. Synced nightly by n8n.`
   - Indexing technique: `High Quality` (uses embeddings; required for the chat app's RAG retrieval to work well)
   - Process rule: `Automatic`
4. Click Save. Copy the **dataset ID** from the URL: it looks like
   `https://cloud.dify.ai/datasets/<UUID>` — the UUID is your
   `DIFY_KB_DATASET_ID`.
5. Workspace → Settings → API Access → Create API Key for **dataset
   access** (NOT for app access — they're different scopes). The
   token starts with `dataset-...`. This is your `DIFY_KB_API_KEY`.

<a id="dify-3"></a>

## 3. Step 2 — set Coolify env vars

Coolify dashboard → Storefront app → Environment Variables → Add:

| Key | Value | Build-time? | Runtime? |
|-----|-------|-------------|----------|
| `DIFY_KB_API_KEY` | `dataset-...` (from step 1.5) | No | Yes |
| `DIFY_KB_DATASET_ID` | the UUID from step 1.4 | No | Yes |

`DIFY_API_URL` is already set (defaults to `https://api.dify.ai/v1`).
No need to change it.

Click Save → Coolify rebuilds the storefront automatically (~3 min).

Or from the CLI:

```
curl -X POST "http://46.62.217.172:8000/api/v1/applications/em2luzsfjoxb77jo3rxl4c9c/envs" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"DIFY_KB_API_KEY","value":"dataset-...","is_preview":false,"is_literal":true}'

curl -X POST "http://46.62.217.172:8000/api/v1/applications/em2luzsfjoxb77jo3rxl4c9c/envs" \
  -H "Authorization: Bearer $COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"DIFY_KB_DATASET_ID","value":"<uuid>","is_preview":false,"is_literal":true}'
```

Then trigger a redeploy so the Next.js process picks up the new env:

```
curl -X POST "http://46.62.217.172:8000/api/v1/deploy?uuid=em2luzsfjoxb77jo3rxl4c9c" \
  -H "Authorization: Bearer $COOLIFY_TOKEN"
```

<a id="dify-4"></a>

## 4. Step 3 — first sync (dryRun)

After the redeploy, hit the endpoint in dryRun mode to confirm
configuration without sending any documents to Dify:

```
curl -sS -X POST https://sericia.com/api/dify-kb-sync \
  -H "x-admin-secret: $SERICIA_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"dryRun":true}'
```

Expected response:

```json
{
  "ok": true,
  "dryRun": true,
  "candidates": 20,
  "sample": [
    { "name": "article:authentic-japanese-matcha-united-states-guide", "length": 4523 },
    { "name": "journal:sencha-regions", "length": 3874 },
    ...
  ]
}
```

If you see `503 dify_kb_not_configured`, env vars aren't loading —
check that the redeploy completed.

If you see `200 ok` with `candidates: 0`, no Payload articles are
published yet — check `/api/pseo/generate` has been firing.

Now run a real (non-dry) sync:

```
curl -sS -X POST https://sericia.com/api/dify-kb-sync \
  -H "x-admin-secret: $SERICIA_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: `{"ok":true, "synced":N, "created":N, "updated":0, "failed":0, "kb_total":N}`.

In Dify dashboard → Knowledge → Sericia Editorial Canon → you should
now see N documents listed.

<a id="dify-5"></a>

## 5. Step 4 — flip n8n cron to active

In n8n → Workflows → "Sericia — Dify KB sync (mirror Payload articles
to chatbot knowledge base)" → toggle **Active**.

The workflow runs daily at 03:00 JST. Each run:

1. Calls `/api/dify-kb-sync` with `since_hours=26` and `max_documents=100`
2. Posts a Slack summary (#all-paradigm) with `{synced, skipped, failed, kb_total}`

If the volume becomes noisy (every day = one Slack ping), comment out
the `notify_slack` node and only the failure path will alert.

<a id="dify-6"></a>

## 6. Verification + rollback

### Verify the chatbot is grounded

Open https://sericia.com/, click the chat icon, ask: *"What's
special about Uji sencha?"*

- Before activation: generic answer about Japanese green tea
- After activation: cites Yamane-en, Yabukita cultivar, single-origin
  details from the Sericia article — phrasing matches the canon

### Rollback

To stop the nightly sync without removing the env vars:

1. n8n → toggle workflow to Inactive

To remove all synced Sericia documents from Dify:

1. Dify dashboard → Knowledge → Sericia Editorial Canon → select-all
   → Delete

To kill the integration entirely:

1. Coolify → delete `DIFY_KB_API_KEY` env var → redeploy
2. The endpoint reverts to 503 `dify_kb_not_configured` — no
   functional impact on the chat app since the chat app reads from
   a different config field (`DIFY_SERVICE_API_KEY`).
