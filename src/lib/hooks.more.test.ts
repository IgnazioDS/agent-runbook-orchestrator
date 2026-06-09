import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAnimatedNumber, useHotkey, usePolling } from "./hooks";

describe("useHotkey", () => {
  it("invokes the handler when the key and meta modifier match", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey("k", handler, { meta: true }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
    });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores keys that do not match", () => {
    const handler = vi.fn();
    renderHook(() => useHotkey("k", handler, { meta: true }));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "j", metaKey: true }));
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it("detaches the listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useHotkey("k", handler));
    unmount();
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k" }));
    });
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("useAnimatedNumber", () => {
  let frames: Array<(t: number) => void>;

  beforeEach(() => {
    frames = [];
    vi.stubGlobal("requestAnimationFrame", (cb: (t: number) => void) => {
      frames.push(cb);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("eases from 0 toward the target as frames advance", () => {
    const { result } = renderHook(() => useAnimatedNumber(100, 50));
    expect(result.current).toBe(0);

    act(() => frames[0]?.(0)); // establish the start timestamp
    act(() => frames[1]?.(50)); // full duration elapsed -> progress 1

    expect(result.current).toBeCloseTo(100, 5);
  });
});

describe("usePolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not fetch while disabled", () => {
    const fetcher = vi.fn();
    const { result } = renderHook(() => usePolling(fetcher, 1000, false));
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
  });

  it("loads data on mount and clears the loading flag", async () => {
    const fetcher = vi.fn().mockResolvedValue({ value: 7 });
    const { result } = renderHook(() => usePolling(fetcher, 1000, true));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ value: 7 });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("captures fetch errors without throwing", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => usePolling(fetcher, 1000, true));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("boom");
    expect(result.current.loading).toBe(false);
  });

  it("reschedules another fetch after the interval", async () => {
    const fetcher = vi.fn().mockResolvedValue({ value: 1 });
    renderHook(() => usePolling(fetcher, 1000, true));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("refetches on demand", async () => {
    const fetcher = vi.fn().mockResolvedValue({ value: 1 });
    const { result } = renderHook(() => usePolling(fetcher, 100000, true));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(fetcher).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refetch();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
