import { matchSearchDocumentQuery, type SearchDocument } from '@rpg/search'

export interface LabelValueDescriptionOption {
  label: string
  value: string
  description?: string
}

/** Maps ComboboxField options to `@rpg/search` documents (label → primary, value → keyword). */
export function assembleComboboxOptionSearchDocument(
  option: LabelValueDescriptionOption,
): SearchDocument {
  const fields = [
    { key: 'label', text: option.label, role: 'primary' as const },
    { key: 'value', text: option.value, role: 'keyword' as const },
    ...(option.description
      ? [{ key: 'description', text: option.description, role: 'secondary' as const }]
      : []),
  ]

  return { id: option.value, fields }
}

export function optionMatchesQuery(option: LabelValueDescriptionOption, query: string): boolean {
  return matchSearchDocumentQuery(assembleComboboxOptionSearchDocument(option), query, {
    profile: 'forgiving',
  }).matched
}
