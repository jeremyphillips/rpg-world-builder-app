export interface LabelValueDescriptionOption {
  label: string
  value: string
  description?: string
}

export function optionMatchesQuery(option: LabelValueDescriptionOption, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return (
    option.label.toLowerCase().includes(normalized) ||
    option.value.toLowerCase().includes(normalized) ||
    (option.description?.toLowerCase().includes(normalized) ?? false)
  )
}
