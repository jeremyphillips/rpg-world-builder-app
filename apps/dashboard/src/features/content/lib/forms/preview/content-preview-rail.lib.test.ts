import { describe, expect, it } from 'vitest'

import {
  resolveContentPreviewAvailability,
  resolveContentPreviewReadinessPanel,
} from './content-preview-rail.lib'
import {
  CONTENT_PREVIEW_NOT_READY_TITLE,
  CONTENT_PREVIEW_READY_TITLE,
} from './content-form-preview-copy'

describe('resolveContentPreviewReadinessPanel', () => {
  it('returns the success panel when the publish schema is valid', () => {
    expect(resolveContentPreviewReadinessPanel(true, false, 0).title).toBe(
      CONTENT_PREVIEW_READY_TITLE,
    )
  })

  it('returns the informational not-ready panel before submit', () => {
    expect(resolveContentPreviewReadinessPanel(false, false, 2).title).toBe(
      CONTENT_PREVIEW_NOT_READY_TITLE,
    )
  })
})

describe('resolveContentPreviewAvailability', () => {
  it('prefers the campaign-access status label', () => {
    expect(
      resolveContentPreviewAvailability(
        { available: true },
        {
          status: { label: 'Available', tone: 'success', indicator: 'dot' },
          detail: 'All players',
        },
      ),
    ).toEqual({
      available: true,
      statusLabel: 'Available',
      detail: 'All players',
    })
  })
})
