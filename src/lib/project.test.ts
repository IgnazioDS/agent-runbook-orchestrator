import { describe, expect, it } from "vitest";
import { PROJECT } from "./project";

describe("PROJECT metadata", () => {
  it("exposes the canonical identity used by the dashboard and telemetry", () => {
    expect(PROJECT.slug).toBe("agent-runbook-orchestrator");
    expect(PROJECT.system_slug).toBe("runbook-orchestrator");
    expect(PROJECT.github_url).toContain("github.com/IgnazioDS/agent-runbook-orchestrator");
  });

  it("declares a non-empty stack and MVP scope", () => {
    expect(PROJECT.stack.length).toBeGreaterThan(0);
    expect(PROJECT.mvp.length).toBeGreaterThan(0);
    expect(PROJECT.stack.every((item) => item.length > 0)).toBe(true);
  });

  it("points every fleet link at the eleventh.dev zone", () => {
    expect(PROJECT.eleventh_url).toBe("https://eleventh.dev");
    expect(PROJECT.fleet_url.startsWith("https://eleventh.dev")).toBe(true);
    expect(PROJECT.live_url.startsWith("https://")).toBe(true);
  });
});
