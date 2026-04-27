/**
 * Project metadata sourced from `src/agent_runbook_orchestrator/project.json`.
 * Hardcoded as a TS module so it ships in the static bundle without runtime
 * file-system access (no JSON-loader plumbing required at build time).
 */

export interface ProjectSpec {
  slug: string;
  name: string;
  category: string;
  track: string;
  stage: string;
  summary: string;
  problem: string;
  users: string;
  stack: string[];
  why_now: string;
  mvp: string[];
  github_url: string;
  /** Slug returned by the system's `/api/stats` endpoint. */
  system_slug: string;
}

export const PROJECT: ProjectSpec = {
  slug: "agent-runbook-orchestrator",
  name: "Agent Runbook Orchestrator",
  category: "Automation",
  track: "Agents",
  stage: "Ready to build",
  summary:
    "A durable execution layer for AI-assisted operational runbooks with approvals, retries, and audit history.",
  problem:
    "Operational workflows break when LLM agents lack state, retry logic, and human checkpoints.",
  users: "Ops teams, founders, agencies, internal tooling teams",
  stack: ["Python", "FastAPI", "PostgreSQL", "Celery", "Playwright"],
  why_now:
    "Teams want agent automation, but trust collapses without execution controls and observability.",
  mvp: [
    "Define runbooks as step graphs",
    "Pause for approval on risky actions",
    "Persist run state and artifacts",
    "Expose replay and audit views",
  ],
  github_url: "https://github.com/IgnazioDS/agent-runbook-orchestrator",
  system_slug: "runbook-orchestrator",
};
