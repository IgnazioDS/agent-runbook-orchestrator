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
