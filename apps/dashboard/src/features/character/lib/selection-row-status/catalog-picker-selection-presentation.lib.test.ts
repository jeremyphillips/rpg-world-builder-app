import { PICKER_DISABLED_REASON_SELECTION_FULL } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { resolveSelectionRowStatusItems } from './resolve-selection-row-status-items.lib'
import { resolveCatalogPickerSelectionPresentation } from './catalog-picker-selection-presentation.lib'

const classRecommendation = {
  kind: 'recommendation' as const,
  discriminator: 'recommended' as const,
  label: 'Recommended by class',
  sourceKind: 'class' as const,
  sourceLabels: ['Wizard class'],
}

describe('resolveCatalogPickerSelectionPresentation', () => {
  it('keeps already-granted on the status line and leaves selection full off it', () => {
    expect(
      resolveCatalogPickerSelectionPresentation({
        facts: undefined,
        disabledNote: PICKER_DISABLED_REASON_SELECTION_FULL,
        includeRecommendations: true,
      }).status,
    ).toEqual([])

    expect(
      resolveCatalogPickerSelectionPresentation({
        facts: undefined,
        disabledNote: 'Already granted by Rogue',
        includeRecommendations: true,
      }).status,
    ).toEqual([
      expect.objectContaining({
        kind: 'notice',
        reason: 'already_granted',
        label: 'Already granted by Rogue',
      }),
    ])
  })

  it('omits recommendation guidance when recommendations are disabled', () => {
    const presentation = resolveCatalogPickerSelectionPresentation({
      facts: [classRecommendation],
      disabledNote: undefined,
      includeRecommendations: false,
    })
    expect(presentation.guidance).toEqual([])
    expect(resolveSelectionRowStatusItems(presentation, { context: 'picker' })).toEqual([])
  })

  it('keeps recommendation guidance when selection full is not a row notice', () => {
    const items = resolveSelectionRowStatusItems(
      resolveCatalogPickerSelectionPresentation({
        facts: [classRecommendation],
        disabledNote: PICKER_DISABLED_REASON_SELECTION_FULL,
        includeRecommendations: true,
      }),
      { context: 'picker' },
    )
    expect(items).toEqual([
      {
        kind: 'text',
        variant: 'guidance',
        label: 'Recommended by class',
        title: 'Wizard class',
      },
    ])
  })
})
