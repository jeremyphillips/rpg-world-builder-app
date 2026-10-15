import { TOOL_CATEGORIES, TOOL_CATEGORY_ENTRIES } from '@rpg/contracts'
import { toOptions, type ComboboxFilterDimensionConfig } from '@rpg/ui/form'

export const TOOL_PROFICIENCY_COMBOBOX_FILTER_KEYS = {
  category: 'category',
} as const

export const TOOL_PROFICIENCY_CATEGORY_FILTER_ARIA = 'Filter tools by category'
export const TOOL_PROFICIENCY_CATEGORY_FILTER_ALL_LABEL = 'All categories'

const toolCategoryOptions = toOptions(
  TOOL_CATEGORIES,
  Object.fromEntries(TOOL_CATEGORIES.map((c) => [c, TOOL_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof TOOL_CATEGORIES)[number],
    string
  >,
)

export function buildToolProficiencyComboboxFilters(): readonly ComboboxFilterDimensionConfig[] {
  return [
    {
      filterKey: TOOL_PROFICIENCY_COMBOBOX_FILTER_KEYS.category,
      ariaLabel: TOOL_PROFICIENCY_CATEGORY_FILTER_ARIA,
      options: toolCategoryOptions,
      allOptionLabel: TOOL_PROFICIENCY_CATEGORY_FILTER_ALL_LABEL,
    },
  ]
}
