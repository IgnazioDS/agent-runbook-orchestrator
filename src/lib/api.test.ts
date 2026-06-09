import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPublicStats, type PublicStats } from "./api";

const sample: PublicStats = {
  system: "runbook-orchestrator",
  mode: "showcase",
  status: "operational",
  last_deployed_at: "2026-06-01T00:00:00Z",
  metrics: {
    commits_30d: 12,
    commits_total: 240,
    primary_language: "TypeScript",
    repo_stars: 3,
    lines_of_code: 1390,
  },
  schema_version: 1,
  generated_at: "2026-06-10T00:00:00Z",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchPublicStats", () => {
  it("requests /api/stats and returns the parsed telemetry payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => sample,
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchPublicStats();

    expect(result).toEqual(sample);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [path, init] = fetchMock.mock.calls[0];
    expect(path).toBe("/api/stats");
    expect(init?.headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("throws a descriptive error when the endpoint returns a non-ok status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        json: async () => ({}),
      }),
    );

    await expect(fetchPublicStats()).rejects.toThrow("Public API 503: Service Unavailable");
  });

  it("propagates network rejections to the caller", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(fetchPublicStats()).rejects.toThrow("network down");
  });
});
