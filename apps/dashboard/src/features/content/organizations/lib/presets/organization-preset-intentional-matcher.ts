import { matchSearchDocumentQuery, type SearchDocument } from '@rpg/search'
import type {
  OrganizationAuthoringPresetEntry,
  OrganizationAuthoringPresetId,
} from '@rpg/contracts'

const INTENTIONAL_SEARCH_PROFILE = 'forgiving' as const

/** Label and explicit discoveryTerms only — description prose does not count as coverage. */
export function assembleIntentionalPresetSearchDocument(
  id: OrganizationAuthoringPresetId,
  preset: OrganizationAuthoringPresetEntry,
): SearchDocument {
  const fields = [
    { key: 'label', text: preset.label, role: 'primary' as const },
    ...(preset.discoveryTerms?.map((term, index) => ({
      key: `discoveryTerm-${index}`,
      text: term,
      role: 'keyword' as const,
    })) ?? []),
  ]

  return { id, fields }
}

export function presetMatchesIntentionalQuery(
  id: OrganizationAuthoringPresetId,
  preset: OrganizationAuthoringPresetEntry,
  query: string,
): boolean {
  return matchSearchDocumentQuery(assembleIntentionalPresetSearchDocument(id, preset), query, {
    profile: INTENTIONAL_SEARCH_PROFILE,
  }).matched
}
