/**
 * Shared user-event helper.
 *
 * Always import `setupUser` from here instead of calling
 * `userEvent.setup()` directly in tests. This guarantees consistent
 * defaults (no implicit pointer-check delays, jsdom-friendly behaviour)
 * and gives us a single place to evolve config later.
 *
 * Usage:
 *   import { setupUser } from "@/test/userEvent";
 *
 *   it("clicks the button", async () => {
 *     const user = setupUser();
 *     render(<MyComponent />);
 *     await user.click(screen.getByRole("button"));
 *   });
 */
import userEvent, { type UserEvent } from "@testing-library/user-event";

export type { UserEvent };

export interface SetupUserOptions {
  /** Delay (ms) between events. `null` = synchronous (default, fastest). */
  delay?: number | null;
  /**
   * Pass-through for any future @testing-library/user-event options.
   * Kept narrow on purpose so tests don't grow ad-hoc config.
   */
  advanceTimers?: (ms: number) => Promise<void> | void;
}

/**
 * Standard userEvent instance for component tests.
 * Defaults: no delay, no fake-timer advancement.
 */
export function setupUser(options: SetupUserOptions = {}): UserEvent {
  const { delay = null, advanceTimers } = options;
  return userEvent.setup({
    delay,
    ...(advanceTimers ? { advanceTimers } : {}),
  });
}

/**
 * Convenience for tests that use vitest fake timers — wires
 * userEvent into `vi.advanceTimersByTime` so awaits resolve.
 *
 * Usage:
 *   import { vi } from "vitest";
 *   vi.useFakeTimers();
 *   const user = setupUserWithFakeTimers(vi);
 */
export function setupUserWithFakeTimers(
  vi: { advanceTimersByTime: (ms: number) => void },
): UserEvent {
  return setupUser({
    advanceTimers: (ms) => {
      vi.advanceTimersByTime(ms);
    },
  });
}

export default setupUser;
