import { describe, expect, it } from 'vitest'

import {
  CONTENT_PREVIEW_NEEDS_ATTENTION,
  CONTENT_PREVIEW_STATUS_OFF,
  CONTENT_PREVIEW_STATUS_READY,
} from './content-form-preview-copy'
import { resolveContentPreviewSectionPresentation } from './content-preview-section-state'

describe('resolveContentPreviewSectionPresentation', () => {
  it('shows an incomplete marker when the section is invalid before submit', () => {
    expect(
      resolveContentPreviewSectionPresentation(
        { derivedKind: 'ready', status: CONTENT_PREVIEW_STATUS_READY },
        false,
        false,
      ),
    ).toEqual({ marker: 'incomplete' })
  })

  it('promotes invalid sections to Needs attention after submit', () => {
    expect(
      resolveContentPreviewSectionPresentation(
        { derivedKind: 'ready', status: CONTENT_PREVIEW_STATUS_READY },
        false,
        true,
      ),
    ).toEqual({
      marker: 'attention',
      status: CONTENT_PREVIEW_NEEDS_ATTENTION,
      statusTone: 'warning',
    })
  })

  it('maps idle derived state when the section is valid', () => {
    expect(
      resolveContentPreviewSectionPresentation(
        { derivedKind: 'off', status: CONTENT_PREVIEW_STATUS_OFF },
        true,
        false,
      ),
    ).toEqual({
      marker: 'idle',
      status: CONTENT_PREVIEW_STATUS_OFF,
    })
  })

  it('maps Ready to a complete marker with success tone', () => {
    expect(
      resolveContentPreviewSectionPresentation(
        { derivedKind: 'ready', status: CONTENT_PREVIEW_STATUS_READY },
        true,
        false,
      ),
    ).toEqual({
      marker: 'complete',
      status: CONTENT_PREVIEW_STATUS_READY,
      statusTone: 'success',
    })
  })
})
