import type { OptionPresentationFact } from '@rpg/contracts'

import { resolveCatalogPickerSelectionPresentation } from '../selection-row-status/catalog-picker-selection-presentation.lib'
import type { SelectionRowPresentation } from '../selection-row-status'

export function resolveProficiencySelectionRowPresentation(args: {
  facts: readonly OptionPresentationFact[] | undefined
  disabledNote: string | undefined
}): SelectionRowPresentation {
  return resolveCatalogPickerSelectionPresentation({
    facts: args.facts,
    disabledNote: args.disabledNote,
    includeRecommendations: true,
  })
}
