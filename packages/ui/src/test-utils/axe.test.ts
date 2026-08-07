import { afterEach, describe, expect, it, vi } from 'vitest'

describe('shouldRunAxe', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns false locally by default', async () => {
    vi.stubEnv('CI', undefined)
    vi.stubEnv('FORCE_AXE', undefined)
    const { shouldRunAxe } = await import('./axe')
    expect(shouldRunAxe()).toBe(false)
  })

  it('returns true when CI is set', async () => {
    vi.stubEnv('CI', 'true')
    vi.stubEnv('FORCE_AXE', undefined)
    vi.resetModules()
    const { shouldRunAxe } = await import('./axe')
    expect(shouldRunAxe()).toBe(true)
  })

  it('returns true when FORCE_AXE is set', async () => {
    vi.stubEnv('CI', undefined)
    vi.stubEnv('FORCE_AXE', '1')
    vi.resetModules()
    const { shouldRunAxe } = await import('./axe')
    expect(shouldRunAxe()).toBe(true)
  })
})

describe('expectNoAxeViolations', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('no-ops locally without running axe', async () => {
    vi.stubEnv('CI', undefined)
    vi.stubEnv('FORCE_AXE', undefined)
    const axe = await import('axe-core')
    const runSpy = vi.spyOn(axe.default, 'run')
    const { expectNoAxeViolations } = await import('./axe')

    await expectNoAxeViolations({} as Element)

    expect(runSpy).not.toHaveBeenCalled()
  })
})
