# hackathon-marketing-ct

Marketing Control Tower — a React-based marketing AI platform built with Vite, TypeScript, and Supabase. It provides AI-powered content generation, client and project management, analytics integrations, and team collaboration tools for marketing agencies.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, shadcn-ui, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **State:** TanStack Query v5
- **AI:** OpenAI, Anthropic Claude, Google Gemini, Perplexity

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for migrations and edge functions)

### Install and run

```bash
npm install
npm run dev
```

The dev server runs at **http://localhost:8080**.

### Environment variables

Create a `.env` file in the project root (or use the values from your Supabase project dashboard):

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_PROJECT_ID=<project-ref>
```

### Demo login (local / staging)

On `/login`, use the **Demo Credentials** section in the Password tab:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | `demo.admin@sjinnovation.com` | `demo-password-123` | `super_admin` |
| User | `demo.user@sjinnovation.com` | `demo-password-123` | `user` |

PM+ role is required for clients, projects, and the Retention Copilot.

### Database and edge functions

Link your Supabase project, apply migrations, and deploy the retention copilot function:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
# If migrations are out of order:
supabase db push --include-all

supabase functions deploy client-health-copilot
supabase functions deploy meeting-transcript-scan
```

Set **Supabase → Edge Functions → Secrets**:

| Secret | Required for |
|--------|----------------|
| `GEMINI_API_KEY` | Client Retention Copilot AI analysis |
| `OPENAI_API_KEY` | Embeddings and other AI features |

Regenerate TypeScript types after schema changes:

```bash
supabase gen types typescript --project-id <your-project-ref> > src/integrations/supabase/types.ts
```

## Development commands

```bash
npm run dev          # Dev server (port 8080)
npm run build        # Production build
npm run build:dev    # Dev build with source maps
npm run lint         # ESLint
npm run preview      # Preview production build
```

Edge functions:

```bash
supabase functions deploy <function-name>
supabase functions logs client-health-copilot
supabase functions serve client-health-copilot
```

## AI Client Retention Copilot

Monitors client health using **delivery signals** from ActiveCollab and Control Tower, plus project-mapped meeting transcripts. Produces churn risk scores, **project-wise** concerns, and recovery task recommendations.

### Analysis logic (how scoring works)

When you click **Analyze Portfolio** (or **Run Analysis** for one client), the `client-health-copilot` edge function runs this pipeline:

```
1. Collect signals (per client)
2. Build project_breakdown (per project)
3. Compute heuristic health score (rule-based)
4. Send signals JSON to Gemini AI
5. Merge AI output + heuristics → risk band
6. Save snapshot to client_health_snapshots
```

#### Step 1 — Signal collection (`collectSignals`)

Loads data for **all clients** (any status: active, inactive, prospect, archived):

| Signal | Source table / field | Logic |
|--------|----------------------|-------|
| Client profile | `clients` | name, company, status, satisfaction_score, revenue |
| Projects | `projects` | All projects where `client_id` matches |
| Tasks | `project_tasks` | Open tasks per project; tagged `activecollab` if `activecollab_task_id` set, else `control_tower` |
| Overdue tasks | `project_tasks.due_date` | Open tasks with `due_date` in the past |
| Approaching deadlines | `project_tasks.due_date` | Open tasks due within **7 days** |
| Stale tasks | `project_tasks.updated_at` | Open tasks with no update in **14+ days** |
| Task comments | `project_task_comments` | Recent comments; scanned for negative keywords |
| Mapped meetings | `project_meetings` | Project-linked Zoom/CT meetings (transcript excerpt) |
| Retention meetings | `projects.retention_meeting_transcripts` | JSONB array from project **Meetings** tab |
| Meeting signal text | `projects.retention_meeting_signal_text` | Generated consolidated transcript text |
| Concern keywords | `retention_meeting_transcripts[].concern_keywords` | Pre-scanned on save (disappointed, sue, overdue, etc.) |

#### Step 2 — Project-wise breakdown (`buildProjectBreakdown`)

For **each project** under the client, builds a `concerns[]` list:

| Concern type | Trigger |
|--------------|---------|
| Overdue delivery | 1+ open tasks past due date |
| Approaching deadlines | 1+ tasks due within 7 days |
| Stale work | 1+ open tasks unchanged 14+ days |
| Negative comment | Task comment contains negative keyword |
| Meeting transcript keywords | Saved `concern_keywords` on project meetings |
| Missing meetings | Active project with no meeting transcripts |

Each project entry also includes: `meeting_concern_keywords`, `meeting_concern_count`, overdue/approaching task lists, and recent comments.

#### Step 3 — Heuristic score (before AI)

Starts from `client.satisfaction_score` (default 85), then applies penalties:

| Penalty | Max deduction |
|---------|----------------|
| Overdue tasks | −5 per task (cap −25) |
| Stale tasks | −10 per task (cap −20) |
| No client meeting 21+ days | −15 |
| Negative task comments | −5 per flag (cap −15) |
| Meeting negative flags | −5 per flag (cap −15) |
| Meeting concern keywords | −4 per keyword (cap −20) |
| 3+ approaching deadlines | −5 |

#### Step 4 — AI analysis (Gemini)

The aggregated `signals` JSON (including full `project_breakdown`) is sent to **Gemini** with a structured prompt. The AI returns:

- `health_score` (0–100)
- `churn_probability` (0.0–1.0)
- `risk_band` — healthy / stable / watch / critical / immediate
- `headline`, `explanation`
- `root_causes[]` — with evidence per project
- `recovery_plan[]` — prioritized actions with owner hints
- `recommended_actions[]` — create task or draft email

AI is instructed to use **project_breakdown** for project-specific concerns and to weight meeting transcript keywords heavily.

#### Step 5 — Risk bands

| Band | Health score | Churn probability |
|------|--------------|-------------------|
| Healthy | 85–100 | < 15% |
| Stable | 70–84 | 15–35% |
| Watch | 50–69 | 35–60% |
| Critical | 30–49 | 60–80% |
| Immediate | 0–29 | > 80% |

#### Step 6 — Persistence

Results saved to `client_health_snapshots` and client fields updated (`health_score`, `churn_risk_band`, `last_health_analysis_at`). Portfolio UI reads latest snapshot per client.

### Data sources (included vs excluded)

#### Included

| Source | DB location | Used for |
|--------|-------------|----------|
| ActiveCollab tasks | `project_tasks` (`activecollab_task_id`) | Overdue, stale, approaching deadlines |
| Control Tower tasks | `project_tasks` (no AC id) | Same delivery signals |
| Task comments | `project_task_comments` | Negative sentiment flags |
| Project deadlines | `projects.deadline` | Delivery timeline |
| Task due dates | `project_tasks.due_date` | Overdue / approaching logic |
| Meeting transcripts | `projects.retention_meeting_transcripts` | Concern keyword scan + AI context |
| Meeting signal text | `projects.retention_meeting_signal_text` | AI narrative input |
| Project-mapped meetings | `project_meetings` | Transcript excerpts |

#### Excluded (by design)

HubSpot CRM fields, Google Analytics, Search Console, Slack, Microsoft Teams, invoice/billing data, and `client_communications` are **not** used for retention scoring.

### Meeting concern keyword scan

On the project **Meetings** tab, transcript links or pasted text are scanned automatically for:

`disappointed`, `frustrated`, `overdue`, `missed deadline`, `sue`, `complaint`, `cancel`, `refund`, `escalate`, and related phrases.

Results stored per meeting: `concern_keywords`, `concern_flags`, `concern_hits`, `has_client_concerns`. These roll up into **project-wise** concerns on the next portfolio analysis.

Edge function: `meeting-transcript-scan` (fetches link content when possible).

### Routes (PM+)

| Route | Description |
|-------|-------------|
| `/client-retention-copilot` | Portfolio view — all clients sorted by churn risk |
| `/client-retention-copilot?client=<id>` | Portfolio focused on one client (opens detail panel) |
| `/clients/:slug` | Client detail — **Retention Portfolio** and **Run Analysis** buttons |
| `/projects/:slug` | Project detail — **Client & Portfolio** panel |
| `/projects/:slug/details` | Imported/ActiveCollab project — meetings tab + client portfolio panel |

### Typical workflow

1. **Seed or sync data** — Run migrations (demo seeds under `supabase/migrations/20260320*`) or sync ActiveCollab / Control Tower projects.
2. **Add meeting signals** — On a project (`/projects/:slug/details` → **Meetings**), add meeting links/dates and optional transcript text. Click **Save meetings** or **Generate retention text** to scan for client concern keywords (disappointed, frustrating, overdue, missed deadline, sue, etc.). Results are stored on each meeting for future retention analysis.
3. **Run analysis** — From the portfolio page click **Analyze Portfolio**, or from a client page click **Run Analysis** (single client). Saved meeting concern keywords are included in the health score and shown **project-wise** in each client's detail panel.
4. **Review results** — Open a client card for health score, project-wise concerns, and recovery actions.

### Key files

| Area | Path |
|------|------|
| Portfolio UI | `src/pages/ClientRetentionCopilot.tsx` |
| Client page actions | `src/pages/ClientDetail.tsx` |
| Project client panel | `src/components/projects/ProjectClientPortfolioPanel.tsx` |
| Meeting inputs | `src/components/projects/ProjectRetentionMeetings.tsx` |
| Data hook | `src/hooks/useClientHealth.ts` |
| Edge function | `supabase/functions/client-health-copilot/index.ts` |

### Troubleshooting

- **Cards show no AI scores** — Click **Analyze Portfolio**. Scores appear only after analysis runs.
- **Analysis fails** — Confirm `GEMINI_API_KEY` is set in Supabase Edge Function secrets and check `supabase functions logs client-health-copilot`.
- **No clients in portfolio** — Ensure clients exist in the `clients` table (all statuses are monitored).
- **Migrations fail on push** — Use `supabase db push --include-all` when local migration timestamps are out of order.

## Documentation

| Document | Audience | Path |
|----------|----------|------|
| **Business overview** | PMs, executives, onboarding | [`.agent/System/marketing-control-tower-business-overview.md`](./.agent/System/marketing-control-tower-business-overview.md) |
| **Architecture** | Engineers, architects | [`.agent/System/marketing-control-tower-architecture.md`](./.agent/System/marketing-control-tower-architecture.md) |
| **Full doc index** | Everyone | [`.agent/README.md`](./.agent/README.md) |
| **Retention Copilot (technical)** | Engineers | [`.agent/System/features/client-retention-copilot.md`](./.agent/System/features/client-retention-copilot.md) |

Project-level AI assistant instructions: [`CLAUDE.md`](./CLAUDE.md).
