# Agent Runbook Orchestrator

> Durable execution layer for AI-assisted operational runbooks. Approvals, retries, audit history. The substrate ops automation needs before it bolts an LLM on top of a cron script.

[**Live dashboard →**](https://agent-runbook-orchestrator.eleventh.dev) · Stage: Ready to build · Track: Agents · Category: Automation

---

## Status: showcase-state

**This repository is in showcase-state.** The orchestrator itself — the durable execution engine, the approval-gate evaluator, the audit-history ledger, the runbook DSL — is not yet in this repo. What ships now is a public dashboard, a stdlib-only telemetry endpoint, and a Python CLI scaffold that exposes the project contract. See [What ships right now](#what-ships-right-now) for the audit.

For an example of what one of these projects looks like once graduated to production, see [NexusRAG](https://github.com/IgnazioDS/NexusRAG) — same operator, same engineering bar, fully shipped (with a directly comparable durable-execution + audit-log pattern).

---

## What this project is

Ops automation written without durable execution discipline produces a predictable failure shape: the script half-runs, fails halfway through, and leaves the system in a state nobody can reason about. Bolting an LLM onto cron-driven scripts inherits every brittleness those scripts already had — plus new ones the model introduces, like prompt-version drift and structured-output validation gaps.

Agent Runbook Orchestrator exists because the alternative — chat-as-orchestrator, Airflow-with-LLM-step, "ChatGPT for SREs" — does not fix the underlying problem. The substrate is the contract. The orchestrator is not a chat surface; it is the state machine the chat surface calls.

## Architectural thesis

- **Durable execution as a first-class primitive.** Not "we'll add retries later." Not "we'll handle idempotency in the script." Every step has an idempotency key, every retry has a bounded backoff, every restart resumes from the last persisted state.
- **Approval gates as data, not code.** The operator tunes approval rules without redeploying. Hard-coded approvals create deploy-friction every time policy shifts; the orchestrator reads gate definitions from a versioned policy store.
- **Audit history as ledger, not logs.** Every step entry, every gate firing, every operator decision, every model output — append-only, signed, replayable. A postmortem reconstructs the run end-to-end without log archaeology.
- **Structured-output validation around model steps.** A model step that emits free-text is a step that breaks the next step. The orchestrator wraps every LLM call with a typed contract; output that fails validation routes to the human-review gate.

## Failure modes this addresses

| Failure mode | What surfaces in production |
|---|---|
| Half-run state corruption | Script fails midway, leaves the system in a state that is neither the start nor the end and cannot be recovered without manual intervention. |
| Silent retry loops | Ops scripts retry without idempotency keys, creating duplicate side effects (double-emails, duplicate refunds, repeated DNS changes) that propagate downstream. |
| Approval bypass under "emergency" | Ops engineers skip approval gates because the gate UI is too slow, then re-discover the gate's reason during the postmortem. |
| Prompt-version drift | A runbook calls a prompt that changed under the operator's feet. The ledger does not record which version was used, so the postmortem cannot tell whether the prompt or the input caused the failure. |
| Free-text model output | Model step emits a string when the next step needed a typed object. The downstream parse fails, the run aborts, the system is half-mutated. |

## Positioning

- **Category claimed**: durable execution layer for AI-assisted ops. Built for teams that run runbooks, not for teams that run scripts.
- **Category refused**: cron-as-orchestrator, Airflow-with-LLM-step, "ChatGPT for SREs", "AI agents will replace ops engineers" registers. The orchestrator is augmentation, not replacement.
- **Closest comparisons**:
  - **Temporal / Cadence** — durable execution frameworks the orchestrator is conceptually adjacent to, but adds AI-specific primitives (approval gates around model output, structured-output validation, prompt versioning, model-step audit format).

---

## Planned MVP

The system the dashboard will graduate to:

- Define runbooks as step graphs (DAG, with explicit edges and gate conditions)
- Pause for approval on risky actions (the gate is data; rules are versioned and operator-tunable)
- Persist run state and artifacts (every step, every input, every output, signed)
- Expose replay and audit views (an entire run reconstructable from the ledger, including which prompt version was used)

**Planned product stack**: Python · FastAPI (control plane) · PostgreSQL (durable state + audit ledger) · Celery (worker pool with idempotent task contract) · Playwright (browser-driven runbook steps).

---

## What ships right now

This is what is in the repo today, audited honestly.

### 1. Showcase dashboard (`/`)

Next.js 14 App Router app at the live URL above. Five routes:

| path | what it shows |
|---|---|
| `/` | Overview — pitch banner, live `/api/stats` Tier-B counters, system status, audience + stack |
| `/telemetry` | Polling telemetry consumer — full metric grid, raw JSON, 30s visibility-aware polling, contract docs |
| `/capabilities` | MVP scope, problem statement, why-now, audience, stack — read from `project.json` |
| `/roadmap` | Three-phase timeline (showcase → MVP build → Tier-A graduation) |
| `/settings` | Theme + project metadata |

### 2. Telemetry endpoint (`api/stats.py`)

Stdlib-only Vercel Python serverless function. Reports honest GitHub-derived signals — commits, stars, last commit, primary language, lines of code. Never simulated workload metrics. Contract documented in [TELEMETRY_SCHEMA.md](https://github.com/IgnazioDS/IgnazioDS/blob/main/TELEMETRY_SCHEMA.md).

### 3. Python CLI scaffold (`src/agent_runbook_orchestrator/`)

Argparse-based CLI exposing the project contract. Currently three subcommands:

```
agent-runbook-orchestrator summary       # name, summary, problem, users, stage, track
agent-runbook-orchestrator capabilities  # planned MVP capabilities
agent-runbook-orchestrator roadmap       # docs/roadmap.md
```

The CLI reads `project.json` — a typed registry that drives both the dashboard's `/capabilities` route and the CLI. When MVP work begins, the runbook DSL, the durable execution engine, and the gate evaluator layer onto this scaffold.

### 4. Deploy + telemetry pipeline

Vercel deploy with `/api/stats` cached 5 minutes, GitHub Actions for the type-check + vitest gate, build-time `_telemetry_static.json` artifact computed by `scripts/compute_telemetry_static.py`.

---

## Architecture (graduation path)

```
┌──── current repo state (showcase-tier) ────────────────────────────┐
│                                                                    │
│  Next.js dashboard ──▶  /api/stats (stdlib Python)  ──▶  GitHub   │
│  (5 routes)              cached 5 min                      API     │
│       │                                                            │
│       └─▶  reads ──▶  project.json  ◀── reads ── Python CLI       │
│                       (typed registry)                             │
└────────────────────────────────────────────────────────────────────┘

                              │  graduates to
                              ▼

┌──── planned MVP (Tier-A) ──────────────────────────────────────────┐
│                                                                    │
│  Runbook DSL (DAG) ──▶  Control plane (FastAPI)                   │
│         │                       │                                  │
│         │                       ▼                                  │
│         │                 Durable state (Postgres)                 │
│         │                  · Step ledger                           │
│         │                  · Idempotency keys                      │
│         │                  · Audit log (signed)                    │
│         │                                                          │
│         ▼                                                          │
│   Worker pool (Celery)                                             │
│         │                                                          │
│         ├──▶ HTTP/CLI step  ──▶ retry w/ backoff                  │
│         ├──▶ Browser step   ──▶ Playwright (sandbox)              │
│         └──▶ Model step     ──▶ structured-output gate            │
│                                       │                            │
│                                       ▼                            │
│                              Approval-gate evaluator               │
│                              (data-driven policy)                  │
│                                       │                            │
│                              ┌────────┴────────┐                   │
│                              ▼                 ▼                   │
│                          Auto-pass       Operator review           │
└────────────────────────────────────────────────────────────────────┘
```

The current dashboard is the public-facing shell. The Python CLI is the spine the MVP orchestrator will extend. `project.json` stays as the single source of truth for what the system claims to be.

---

## Quickstart

### Run the showcase dashboard

```bash
git clone https://github.com/IgnazioDS/agent-runbook-orchestrator.git
cd agent-runbook-orchestrator
npm install
npm run dev          # http://localhost:3000
```

### Run the Python CLI scaffold

```bash
cd agent-runbook-orchestrator
python -m agent_runbook_orchestrator.cli summary
python -m agent_runbook_orchestrator.cli capabilities
python -m agent_runbook_orchestrator.cli roadmap
```

### Test + type-check

```bash
npm run lint
npm run type-check
npm test                    # vitest suite
python -m pytest tests/     # python tests
```

---

## Dashboard stack

Next.js 14 App Router · TypeScript strict · Tailwind 3 · Geist Sans + Mono · Radix UI · cmdk (⌘K) · sonner · next-themes · framer-motion · vitest + Testing Library.

### Keyboard shortcuts

| keys | action |
|---|---|
| ⌘K / Ctrl+K | Command palette |
| G then O / T / C / R | Overview / Telemetry / Capabilities / Roadmap |

---

## More context

- **Operator's hub**: [eleventh.dev](https://eleventh.dev) — the public site this dashboard's telemetry feeds into
- **Reference shipped project**: [NexusRAG](https://github.com/IgnazioDS/NexusRAG) — production-grade multi-tenant RAG platform with the directly comparable durable-execution + tamper-evident audit-log pattern this orchestrator will share
- **Telemetry contract**: [TELEMETRY_SCHEMA.md](https://github.com/IgnazioDS/IgnazioDS/blob/main/TELEMETRY_SCHEMA.md) — what the Tier-B counters mean and what they don't
- **Status of this project**: showcase-tier. The orchestrator graduates when the durable state engine, the approval-gate evaluator, and the structured-output gate are live against a real runbook.

---

## License

MIT — see [LICENSE](./LICENSE).
