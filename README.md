# Agent Runbook Orchestrator

A durable execution layer for AI-assisted operational runbooks with approvals, retries, and audit history.

## Problem

Operational workflows break when LLM agents lack state, retry logic, and human checkpoints.

## Users

Ops teams, founders, agencies, internal tooling teams

## Core Capabilities

- Define runbooks as step graphs
- Pause for approval on risky actions
- Persist run state and artifacts
- Expose replay and audit views

## Why This Matters

Teams want agent automation, but trust collapses without execution controls and observability.

## Architecture

- `core`: domain logic for agent runbook orchestrator.
- `cli`: operator-facing entrypoint for local workflows and smoke checks.
- `docs/`: product notes, roadmap, and architecture decisions.
- `tests/`: baseline regression coverage for the project contract.

## Local Usage

```bash
uv run agent-runbook-orchestrator summary
uv run agent-runbook-orchestrator capabilities
uv run agent-runbook-orchestrator roadmap
```

## Initial Stack Direction

Python, FastAPI, PostgreSQL, Celery, Playwright

## Delivery Standard

- Clear product thesis
- Setup that works locally
- Tests for the primary contract
- Documentation for roadmap and architecture
- Space for production integrations in the next iteration

## Showcase

This repository ships with a static Vercel-ready landing page for demos and previews.

```bash
vercel deploy -y
```

The deployed site presents Agent Runbook Orchestrator as a standalone product page.

## Production telemetry

This deployment exposes public, aggregate metrics at `/api/stats`. The endpoint
is consumed by the Production Telemetry panel on https://eleventh.dev. The
schema is documented at
https://github.com/IgnazioDS/IgnazioDS/blob/main/TELEMETRY_SCHEMA.md.

This system is in **showcase mode** — the Vercel deploy is a public landing
page, not a system processing production workload. The endpoint exposes real
GitHub-derived metrics about the codebase rather than fabricated activity
counters. Tier-A workload metrics (`runbooks_active_now`, `approvals_pending`,
etc.) are added when the system is promoted from showcase to production.

Sample response:

```bash
$ curl -i https://agent-runbook-orchestrator.vercel.app/api/stats
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=30, stale-while-revalidate=60
Access-Control-Allow-Origin: *

{
  "system": "runbook-orchestrator",
  "mode": "showcase",
  "status": "operational",
  "last_deployed_at": "2026-04-27T18:37:45Z",
  "last_commit_at": "2026-04-01T18:28:15Z",
  "metrics": {
    "commits_30d": 1,
    "commits_total": 4,
    "primary_language": "Python",
    "repo_stars": 0,
    "lines_of_code": 1390
  },
  "schema_version": 1,
  "generated_at": "2026-04-27T18:38:46Z"
}
```

The endpoint never returns HTTP 5xx. If GitHub is unreachable, the response
status flips to `"degraded"` and metric values fall back to last known good
(or zero) values, while the JSON contract remains valid.

To regenerate `lines_of_code` before deploying:

```bash
python3 scripts/compute_telemetry_static.py
git add api/_telemetry_static.json
```
