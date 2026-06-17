# Adoption Stats Export API

Marketing Control Tower exposes the [Control Tower Adoption Stats Export API](https://github.com/sjinnovation/sj-control-tower/blob/main/docs/05-integrations/CONTROL-TOWER-ADOPTION-STATS-EXPORT-API.md) so Main CT can pull per-user adoption metrics.

## Edge function

| Item | Value |
|---|---|
| Function | `analytics-adoption` |
| Base URL | `{SUPABASE_URL}/functions/v1/analytics-adoption` |
| Spec version | `1.0.0` |
| Control tower name | `SJ Marketing Control Tower` |

### Endpoints

```bash
# Ping (preferred liveness check)
curl -s "{BASE}/analytics/ping" -H "Authorization: Bearer {key}"

# Health fallback
curl -s "{BASE}/health" -H "Authorization: Bearer {key}"

# Per-user adoption payload
curl -s "{BASE}/analytics/users/jane.doe@sjinnovation.com" \
  -H "Authorization: Bearer {key}" \
  -H "Accept: application/json"
```

`x-api-key: {key}` is also supported.

## Authentication

Issue a read-only key via `analytics_api_keys` with `allowed_actions` containing `adoption-export` (or empty array for all actions):

```sql
-- Generate key: mct_adopt_$(openssl rand -hex 24)
-- Hash with SHA-256 hex before insert
INSERT INTO analytics_api_keys (key_name, key_hash, rate_limit_per_minute, allowed_actions)
VALUES (
  'main-ct-adoption',
  '{sha256_hex_of_raw_key}',
  60,
  ARRAY['adoption-export']
);
```

Alternatively set edge secret `ANALYTICS_EXPORT_API_KEY` for a single static key.

## Main CT registration

| Field | Example |
|---|---|
| Name | `SJ Marketing Control Tower` |
| API URL | `https://ckaaawiiczphdssrtymc.supabase.co/functions/v1/analytics-adoption` |
| API Key | (raw key from step above) |

## Data sources

- `user_activity_logs` — login, page_view, and action events (tracked client-side via `ActivityTrackerProvider`)
- `employees` — department and manager detection (`reporting_manager_email`)
- `project_tasks` — manager weekly task-update compliance fallback

## Deploy

```bash
supabase db push
supabase functions deploy analytics-adoption
```

## Marketing modules reported

`Dashboard`, `Actions`, `Clients`, `Projects`, `Knowledge`, `CollabAI`, `Brands`, `Meetings`, `Marketing:LinkedIn Content`, `Marketing:Image AI`, `Marketing:Video`, `Admin`
