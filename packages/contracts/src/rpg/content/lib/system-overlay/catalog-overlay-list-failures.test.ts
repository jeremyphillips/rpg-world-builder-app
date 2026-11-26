import { describe, expect, it } from 'vitest'

import {
  catalogOverlayListFailureMessage,
  overlayApplyFailureToListCode,
  overlayFailureToListEntry,
} from './catalog-overlay-list-failures'
import type { OverlayApplyFailure } from './overlay-failures'

const seedRow = { id: 'srd-2024:fighter', slug: 'fighter', name: 'Fighter' }

describe('catalog overlay list failures', () => {
  it.each([
    [
      { code: 'unsupported-overlay-version', version: 0 } satisfies OverlayApplyFailure,
      'unsupported_overlay_version',
    ],
    [
      {
        code: 'unsupported-overlay-retention',
        retention: 'legacy-array',
        path: 'traits',
      } satisfies OverlayApplyFailure,
      'unsupported_overlay_retention',
    ],
    [
      { code: 'overlay-validation', issues: ['bad'] } satisfies OverlayApplyFailure,
      'overlay_validation',
    ],
    [
      { code: 'overlay-invalid-order', path: 'traits' } satisfies OverlayApplyFailure,
      'overlay_invalid_order',
    ],
  ] as const)('maps apply failure %s to public list code', (failure, code) => {
    expect(overlayApplyFailureToListCode(failure)).toBe(code)
    expect(overlayFailureToListEntry(seedRow, failure)).toEqual({
      targetId: seedRow.id,
      slug: seedRow.slug,
      name: seedRow.name,
      code,
      message: catalogOverlayListFailureMessage(code),
    })
  })

  it('does not include validation issues on the list wire', () => {
    const entry = overlayFailureToListEntry(seedRow, {
      code: 'overlay-validation',
      issues: ['nested path invalid'],
    })
    expect(entry).not.toHaveProperty('issues')
    expect(entry.message).toBe('Stored system overlay is invalid.')
  })
})
