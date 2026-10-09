import type { OptionPresentationFact } from '@rpg/contracts'

import { resolveCatalogPickerSelectionPresentation } from '../selection-row-status/catalog-picker-selection-presentation.lib'
import type { SelectionRowPresentation } from '../selection-row-status'

export function resolveSpellSelectionRowPresentation(args: {
  facts: readonly OptionPresentationFact[] | undefined
  /** Domain input. When false, the presentation emits no recommendation entries. */
  recommendationsEnabled: boolean
  disabledNote: string | undefined
}): SelectionRowPresentation {
  return resolveCatalogPickerSelectionPresentation({
    facts: args.facts,
    disabledNote: args.disabledNote,
    includeRecommendations: args.recommendationsEnabled,
  })
}
