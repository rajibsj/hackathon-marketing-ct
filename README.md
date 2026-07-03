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

Monitors client health using **delivery signals** from ActiveCollab and Control Tower, plus project-mapped meeting transcripts. Produces churn risk scores, project-wise concerns, and recovery task recommendations.

### Routes (PM+)

| Route | Description |
|-------|-------------|
| `/client-retention-copilot` | Portfolio view — all clients sorted by churn risk |
| `/client-retention-copilot?client=<id>` | Portfolio focused on one client (opens detail panel) |
| `/clients/:slug` | Client detail — **Retention Portfolio** and **Run Analysis** buttons |
| `/projects/:slug` | Project detail — **Client & Portfolio** panel |
| `/projects/:slug/details` | Imported/ActiveCollab project — meetings tab + client portfolio panel |

### Data sources (what the copilot uses)

| Source | Where it comes from |
|--------|---------------------|
| ActiveCollab tasks | `project_tasks` linked via `activecollab_task_id` |
| Control Tower tasks | `project_tasks` from Control Tower sync |
| Task comments | `project_task_comments` |
| Deadlines | Project `deadline` and task `due_date` |
| Meeting transcripts | Project **Meetings** tab → retention meeting links/dates/text |

**Not used:** HubSpot, Google Analytics, Search Console, Slack, Teams, invoice data.

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

Detailed architecture, database schema, and SOPs live in [`.agent/README.md`](./.agent/README.md).

Feature-specific guide: [`.agent/System/features/client-retention-copilot.md`](./.agent/System/features/client-retention-copilot.md).

Project-level AI assistant instructions: [`CLAUDE.md`](./CLAUDE.md).
