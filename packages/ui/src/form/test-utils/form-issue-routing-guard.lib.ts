import { afterEach, beforeEach } from 'vitest'

import { FORM_ISSUE_ROUTING_FALLBACK_LOG } from '../errors/route-form-issues.lib'

const fallbackCallsByTest = new Map<string, string[]>()
const allowFallbackTests = new Set<string>()

function activeTestKey(): string {
  return expect.getState().currentTestName ?? '__unknown__'
}

/** Opt out of the global fallback-claim guard for the active test. */
export function allowFormIssueRoutingFallback(): void {
  allowFallbackTests.add(activeTestKey())
}

export function installFormIssueRoutingFallbackGuard(): void {
  const originalError = console.error

  console.error = (...args: unknown[]) => {
    if (args[0] === FORM_ISSUE_ROUTING_FALLBACK_LOG && typeof args[1] === 'string') {
      const calls = fallbackCallsByTest.get(activeTestKey())
      calls?.push(args[1])
    }
    originalError(...args)
  }

  beforeEach(() => {
    fallbackCallsByTest.set(activeTestKey(), [])
  })

  afterEach(() => {
    const key = activeTestKey()
    const calls = fallbackCallsByTest.get(key) ?? []
    const allowed = allowFallbackTests.has(key)
    fallbackCallsByTest.delete(key)
    allowFallbackTests.delete(key)
    if (!allowed && calls.length > 0) {
      throw new Error(`Unexpected form issue routing fallbacks: ${calls.join(', ')}`)
    }
  })
}
