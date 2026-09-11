import { describe, expect, it } from 'vitest'

import {
  CONTENT_PREVIEW_NEEDS_ATTENTION,
  CONTENT_PREVIEW_NOT_SET,
  CONTENT_PREVIEW_STATUS_NONE,
  CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
  CONTENT_PREVIEW_STATUS_OFF,
  CONTENT_PREVIEW_STATUS_READY,
} from './content-form-preview-copy'
import type { ContentPreviewDerivedKind } from './content-form-preview.types'
import {
  isContentPreviewSectionExpandable,
  resolveContentPreviewSectionBodyProps,
  resolveContentPreviewSectionPresentation,
  resolveDerivedContentPreviewPresentation,
} from './content-preview-section-state'

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
      marker: 'needsAttention',
      status: CONTENT_PREVIEW_NEEDS_ATTENTION,
      statusTone: 'warning',
    })
  })

  it('maps Ready to a ready marker with success tone', () => {
    expect(
      resolveContentPreviewSectionPresentation(
        { derivedKind: 'ready', status: CONTENT_PREVIEW_STATUS_READY },
        true,
        false,
      ),
    ).toEqual({
      marker: 'ready',
      status: CONTENT_PREVIEW_STATUS_READY,
      statusTone: 'success',
    })
  })
})

describe('resolveDerivedContentPreviewPresentation', () => {
  it.each([
    ['off', 'off', CONTENT_PREVIEW_STATUS_OFF],
    ['none', 'none', CONTENT_PREVIEW_STATUS_NONE],
    ['notConfigured', 'notConfigured', CONTENT_PREVIEW_STATUS_NOT_CONFIGURED],
  ] as const satisfies ReadonlyArray<
    [ContentPreviewDerivedKind, 'off' | 'none' | 'notConfigured', string]
  >)('maps %s to the %s marker', (derivedKind, marker, status) => {
    expect(resolveDerivedContentPreviewPresentation({ derivedKind, status })).toEqual({
      marker,
      status,
    })
  })

  it.each(['ready', 'count'] as const satisfies readonly ContentPreviewDerivedKind[])(
    'maps %s to ready',
    (derivedKind) => {
      expect(
        resolveDerivedContentPreviewPresentation({
          derivedKind,
          status: 'Prepared',
        }),
      ).toEqual({
        marker: 'ready',
        status: 'Prepared',
      })
    },
  )

  it('uses success tone only for Ready complete sections', () => {
    expect(
      resolveDerivedContentPreviewPresentation({
        derivedKind: 'count',
        status: '20 features',
      }),
    ).toEqual({
      marker: 'ready',
      status: '20 features',
    })
  })
})

describe('isContentPreviewSectionExpandable', () => {
  it('is true when description or facts are present', () => {
    expect(
      isContentPreviewSectionExpandable({
        derivedKind: 'ready',
        description: 'Summary',
      }),
    ).toBe(true)
    expect(
      isContentPreviewSectionExpandable({
        derivedKind: 'ready',
        facts: [{ label: 'Hit die', value: CONTENT_PREVIEW_NOT_SET }],
      }),
    ).toBe(true)
  })

  it('is false for status-only rows', () => {
    expect(
      isContentPreviewSectionExpandable({
        derivedKind: 'off',
        status: CONTENT_PREVIEW_STATUS_OFF,
      }),
    ).toBe(false)
    expect(
      isContentPreviewSectionExpandable({
        derivedKind: 'none',
        status: CONTENT_PREVIEW_STATUS_NONE,
      }),
    ).toBe(false)
    expect(
      isContentPreviewSectionExpandable({
        derivedKind: 'notConfigured',
        status: CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
      }),
    ).toBe(false)
  })
})

describe('resolveContentPreviewSectionBodyProps', () => {
  it('returns facts for proficiencies rows that are Not set', () => {
    const facts = [
      { label: 'Saving throws', value: CONTENT_PREVIEW_NOT_SET },
      { label: 'Armor training', value: CONTENT_PREVIEW_NOT_SET },
    ]

    expect(
      resolveContentPreviewSectionBodyProps({
        derivedKind: 'ready',
        status: CONTENT_PREVIEW_STATUS_READY,
        facts,
      }),
    ).toEqual({ facts })
  })

  it('returns null for status-only sections', () => {
    expect(
      resolveContentPreviewSectionBodyProps({
        derivedKind: 'notConfigured',
        status: CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
      }),
    ).toBeNull()
  })

  it('returns null when there is no preview content', () => {
    expect(
      resolveContentPreviewSectionBodyProps({
        derivedKind: 'ready',
      }),
    ).toBeNull()
  })
})
