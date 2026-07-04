import { scoreItem, type WeightedSearchField } from '../../lib/search'

export interface LabelValueDescriptionOption {
  label: string
  value: string
  description?: string
}

function optionSearchFields(option: LabelValueDescriptionOption): WeightedSearchField[] {
  const fields: WeightedSearchField[] = [
    { text: option.label, weight: 1, role: 'label' },
    { text: option.value, weight: 1, role: 'alias' },
  ]
  if (option.description) {
    fields.push({ text: option.description, weight: 1, role: 'description' })
  }
  return fields
}

export function optionMatchesQuery(option: LabelValueDescriptionOption, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return scoreItem({ fields: optionSearchFields(option) }, normalized) > 0
}
