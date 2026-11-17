import { describe, expect, it, vi } from 'vitest'

import { resolveInlineSentenceOccupantLabel } from './inline-sentence-occupant-label.lib'

describe('resolveInlineSentenceOccupantLabel', () => {
  it('prefers segment label over control ariaLabel', () => {
    expect(
      resolveInlineSentenceOccupantLabel({
        label: 'Mode',
        ariaLabel: 'Movement mode',
        segmentName: 'mode',
      }),
    ).toBe('Mode')
  })

  it('falls back to ariaLabel when label is absent', () => {
    expect(
      resolveInlineSentenceOccupantLabel({
        ariaLabel: 'Speed',
        segmentName: 'speed',
      }),
    ).toBe('Speed')
  })

  it('throws in development when both names are missing', () => {
    vi.stubEnv('NODE_ENV', 'development')
    expect(() => resolveInlineSentenceOccupantLabel({ segmentName: 'modeSelect' })).toThrow(
      /requires segment.label or control.ariaLabel/,
    )
    vi.unstubAllEnvs()
  })
})
