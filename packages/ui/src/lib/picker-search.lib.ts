import type { SearchDocument } from '@rpg/search'

import type { SearchFieldRole, WeightedSearchField } from './search'
import type { PickerSearchOptions } from './picker-search.types'

export type { PickerSearchOptions } from './picker-search.types'

type PickerSearchFieldInput = {
  label: string
  supportingText?: string
  searchTerms?: readonly string[]
  aliases?: readonly string[]
  groupLabel?: string
  includeSupporting: boolean
  valueSlug?: string
}

type PickerSearchField = {
  key: string
  text: string
  legacyRole: SearchFieldRole
}

/** Transitional default: index supporting text when `search` is omitted (combobox). */
export function resolveIncludeSupportingForCombobox(
  search: PickerSearchOptions | undefined,
  hasSupportingText: boolean,
): boolean {
  if (search?.includeSupporting !== undefined) return search.includeSupporting
  return hasSupportingText
}

/** Transitional default: index supporting text when `search` is omitted (dropdown). */
export function resolveIncludeSupportingForDropdown(
  search: PickerSearchOptions | undefined,
): boolean {
  if (search?.includeSupporting !== undefined) return search.includeSupporting
  return true
}

export function buildPickerSearchFields(
  input: PickerSearchFieldInput,
): readonly PickerSearchField[] {
  const fields: PickerSearchField[] = [{ key: 'label', text: input.label, legacyRole: 'label' }]

  if (input.valueSlug) {
    fields.push({ key: 'value', text: input.valueSlug, legacyRole: 'keyword' })
  }
  if (input.includeSupporting && input.supportingText) {
    fields.push({ key: 'metadata', text: input.supportingText, legacyRole: 'description' })
  }
  for (const [index, alias] of (input.aliases ?? []).entries()) {
    fields.push({ key: `alias-${index}`, text: alias, legacyRole: 'alias' })
  }
  for (const [index, term] of (input.searchTerms ?? []).entries()) {
    fields.push({ key: `searchTerm-${index}`, text: term, legacyRole: 'keyword' })
  }
  if (input.groupLabel) {
    fields.push({ key: 'group', text: input.groupLabel, legacyRole: 'group' })
  }

  return fields
}

export function mapPickerFieldsToSearchDocument(
  id: string,
  fields: readonly PickerSearchField[],
): SearchDocument {
  return {
    id,
    fields: fields.map((field) => {
      switch (field.legacyRole) {
        case 'label':
          return { key: field.key, text: field.text, role: 'primary' as const }
        case 'description':
        case 'group':
          return { key: field.key, text: field.text, role: 'secondary' as const }
        case 'alias':
        case 'keyword':
          return { key: field.key, text: field.text, role: 'keyword' as const }
      }
    }),
  }
}

export function mapPickerFieldsToLegacyWeighted(
  fields: readonly PickerSearchField[],
): WeightedSearchField[] {
  return fields.map((field) => ({
    text: field.text,
    weight: 1,
    role: field.legacyRole,
  }))
}
