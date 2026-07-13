import { TOOL_CATEGORY_ENTRIES, type ToolCategory } from '@rpg/contracts'

/** Suggests a human-readable tool proficiency choice label from selected categories. */
export function suggestToolProficiencyChoiceLabel(categories: readonly string[]): string {
  const labels: string[] = []

  for (const category of categories) {
    const label = TOOL_CATEGORY_ENTRIES[category as ToolCategory]?.label
    if (label) labels.push(label)
  }

  if (labels.length === 0) return ''
  if (labels.length === 1) return labels[0]!
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, or ${labels[labels.length - 1]}`
}
