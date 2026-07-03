# Client Retention Copilot

> **Last Updated:** 2026-03-20  
> **Status:** Active

AI-powered client health monitoring for PMs and account leads. Aggregates delivery signals per client and project, runs Gemini analysis, and surfaces churn risk with recovery recommendations.

---

## Overview

The Retention Copilot answers: *Is this client at risk, why, and what should we do next?*

It analyzes **all clients** in the portfolio (not only `active` status). Concerns are grouped **project-by-project** via `project_breakdown` in the edge function response.

---

## Architecture

```
┌─────────────────┐     ┌──────────────────────────┐     ┌─────────────────────┐
│  React UI       │────▶│  client-health-copilot   │────▶│  Gemini API         │
│  useClientHealth│     │  (Edge Function)         │     │                     │
└────────┬────────┘     └────────────┬─────────────┘     └─────────────────────┘
         │                           │
         │                           ▼
         │              ┌──────────────────────────┐
         └─────────────▶│  PostgreSQL              │
                        │  clients, projects,      │
                        │  project_tasks, comments,│
                        │  client_health_snapshots │
                        └──────────────────────────┘
```

### Edge function

- **Name:** `client-health-copilot`
- **Path:** `supabase/functions/client-health-copilot/index.ts`
- **Auth:** JWT required; PM+ role via `requireRole`
- **Body:** `{ client_id?: string }` — omit for full portfolio analyze

### Frontend hook

- **Path:** `src/hooks/useClientHealth.ts`
- **Query key:** `client-health-snapshots`
- **Mutations:** `analyzePortfolio(clientId?)` invokes the edge function

---

## Data sources

### Included

| Signal | Tables / fields | Notes |
|--------|-----------------|-------|
| ActiveCollab tasks | `project_tasks` where `activecollab_task_id` is set | Tagged `source: "activecollab"` |
| Control Tower tasks | `project_tasks` from CT sync | Tagged `source: "control_tower"` |
| Comments | `project_task_comments` | Stale threads, negative keywords |
| Deadlines | `projects.deadline`, `project_tasks.due_date` | Overdue and approaching |
| Meetings | `projects.retention_meeting_transcripts`, `retention_meeting_signal_text` | Project-mapped only |

### Excluded (by design)

- HubSpot CRM fields
- Google Analytics / Search Console
- Slack / Microsoft Teams
- `client_communications` table (legacy seed may exist; not read by copilot)
- Invoice / billing data

---

## UI entry points

| Location | Actions |
|----------|---------|
| Sidebar | **Retention Copilot** → `/client-retention-copilot` |
| Client detail | **Retention Portfolio**, **Run Analysis** |
| Project detail | **Client & Portfolio** panel (view client, portfolio link, sibling projects) |
| Imported project | Same panel + **Meetings** tab for transcript inputs |

### URL helpers

- `getClientRetentionCopilotUrl(clientId)` — `src/lib/clientSlugUtils.ts`
- `?client=<uuid>` on portfolio page auto-opens that client's detail panel

---

## Meeting signal setup

On imported project detail (`/projects/:slug/details` → **Meetings**):

1. Add one or more rows: title, date, transcript link (and optional transcript text).
2. Click **Generate retention text** to build `retention_meeting_signal_text`.
3. Re-run portfolio analysis to include updated meeting context.

**Component:** `src/components/projects/ProjectRetentionMeetings.tsx`  
**Helpers:** `src/lib/retentionMeetingText.ts`

---

## Database

### Key tables

- `clients` — `health_score`, `churn_risk_band`, `last_health_analysis_at`
- `client_health_snapshots` — historical analysis results
- `projects` — `retention_meeting_transcripts` (JSONB), `retention_meeting_signal_text`
- `project_tasks`, `project_task_comments`

### Relevant migrations (2026-03)

| Migration | Purpose |
|-----------|---------|
| `20260320110000_seed_retention_copilot_demo.sql` | Demo copilot agent config |
| `20260320120000_fix_retention_copilot_access.sql` | RLS / access fixes |
| `20260320180000_client_health_data_sources.sql` | Data source tables |
| `20260320130000_seed_control_tower_demo.sql` | CT demo projects |
| `20260320140000_seed_client_control_tower_projects.sql` | Client–project links |
| `20260320160000_seed_recovery_tasks_demo.sql` | Recovery task demo |
| `20260320170000_seed_hub_client_task_signals.sql` | Task signal demo |
| `20260320210000_project_retention_meetings.sql` | Meeting transcript columns |
| `20260320220000_retention_copilot_sources.sql` | Prompt: CT-only sources |
| `20260320230000_retention_copilot_activecollab.sql` | Prompt: AC + CT sources |

Apply with:

```bash
supabase db push
# or if out of order:
supabase db push --include-all
```

---

## Deployment checklist

1. `supabase db push` (or `--include-all`)
2. `supabase functions deploy client-health-copilot`
3. Set `GEMINI_API_KEY` in Supabase Edge Function secrets
4. Log in as PM+ and run **Analyze Portfolio** on `/client-retention-copilot`

---

## Recovery tasks

AI-recommended actions can create recovery tasks tagged with source `client-retention-copilot` and title prefix `[Recovery]`.

See `useClientHealth.ts` constants: `RECOVERY_TASK_SOURCE`, `RECOVERY_TITLE_PREFIX`.

---

## Related components

| Component | Path |
|-----------|------|
| Portfolio page | `src/pages/ClientRetentionCopilot.tsx` |
| Health cards | `src/components/client-health/ClientHealthCard.tsx` |
| Detail panel | `src/components/client-health/ClientHealthDetailPanel.tsx` |
| Project concerns | `src/components/client-health/ClientProjectConcerns.tsx` |
| Client portfolio panel | `src/components/projects/ProjectClientPortfolioPanel.tsx` |
