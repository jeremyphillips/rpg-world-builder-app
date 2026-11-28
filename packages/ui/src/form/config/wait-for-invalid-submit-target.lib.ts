import { FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS } from '../lifecycle/form-validation-pilot-budgets.lib'

const REVEAL_POLL_INTERVAL_MS = 16

export type WaitForInvalidSubmitTargetOptions = {
  budgetMs?: number
  pollIntervalMs?: number
  now?: () => number
  delay?: (ms: number) => Promise<void>
}

async function pollUntilReady(
  isReady: () => boolean,
  deadline: number,
  pollIntervalMs: number,
  now: () => number,
  delay: (ms: number) => Promise<void>,
): Promise<boolean> {
  while (now() < deadline) {
    await delay(pollIntervalMs)
    if (isReady()) return true
  }
  return isReady()
}

/**
 * Poll until `isReady` returns true or the pilot reveal budget elapses.
 */
export async function waitForInvalidSubmitTarget(
  isReady: () => boolean,
  options?: WaitForInvalidSubmitTargetOptions,
): Promise<boolean> {
  if (isReady()) return true

  const budgetMs = options?.budgetMs ?? FORM_VALIDATION_PILOT_REVEAL_BUDGET_MS
  const pollIntervalMs = options?.pollIntervalMs ?? REVEAL_POLL_INTERVAL_MS
  const now = options?.now ?? (() => performance.now())
  const delay =
    options?.delay ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)))

  return pollUntilReady(isReady, now() + budgetMs, pollIntervalMs, now, delay)
}
