import { PICKER_DISABLED_REASON_SELECTION_FULL, type OptionPresentationFact } from '@rpg/contracts'

import { selectionNotice } from './selection-row-entries.lib'
import {
  mergeSelectionRowPresentations,
  selectionPresentationFromFacts,
} from './selection-presentation-from-facts.lib'
import type { SelectionRowPresentation, SelectionStatusEntry } from './selection-row-status.types'

/** Matches `grantedDisabledReason` in the proficiency picker resolver. */
const ALREADY_GRANTED_DISABLED_REASON_PREFIX = 'Already granted by '

function catalogPickerCapacityNotices(disabledNote: string | undefined): SelectionStatusEntry[] {
  if (!disabledNote) return []
  if (disabledNote.startsWith(ALREADY_GRANTED_DISABLED_REASON_PREFIX)) {
    return [selectionNotice('already_granted', disabledNote)]
  }
  if (disabledNote === PICKER_DISABLED_REASON_SELECTION_FULL) {
    return [selectionNotice('selection_full', disabledNote)]
  }
  return []
}

/**
 * Spell and proficiency picker rows: contracts facts plus a capacity notice from the
 * shared disabled-note string. `includeRecommendations` is a domain input — when false,
 * recommendation guidance is omitted before the context policy runs.
 */
export function resolveCatalogPickerSelectionPresentation(args: {
  facts: readonly OptionPresentationFact[] | undefined
  disabledNote: string | undefined
  includeRecommendations: boolean
}): SelectionRowPresentation {
  const fromFacts = selectionPresentationFromFacts(args.facts)
  return mergeSelectionRowPresentations(
    { status: catalogPickerCapacityNotices(args.disabledNote), guidance: [] },
    {
      status: fromFacts.status,
      guidance: args.includeRecommendations
        ? fromFacts.guidance
        : fromFacts.guidance.filter((entry) => entry.kind !== 'recommendation'),
    },
  )
}
