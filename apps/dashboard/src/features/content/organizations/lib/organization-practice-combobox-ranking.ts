import type { OrganizationPractice } from '@rpg/contracts'
import { rankOptionsByQuery, type LabelValueDescriptionOption } from '@rpg/ui'

function prependSelectedNonMatches<T extends LabelValueDescriptionOption>(
  options: readonly T[],
  matched: readonly T[],
  selected: readonly string[],
): T[] {
  const matchedValues = new Set(matched.map((option) => option.value))
  const selectedExtras: T[] = []
  for (const value of selected) {
    if (matchedValues.has(value)) continue
    const option = options.find((entry) => entry.value === value)
    if (option) selectedExtras.push(option)
  }
  return [...selectedExtras, ...matched]
}

function rankEmptyQueryOrganizationPractices<T extends LabelValueDescriptionOption>(
  options: readonly T[],
  selected: readonly string[],
  recommendedPracticeIds: readonly OrganizationPractice[],
): T[] {
  const selectedSet = new Set(selected)
  const ranked: T[] = []
  const used = new Set<string>()

  for (const value of selected) {
    const option = options.find((entry) => entry.value === value)
    if (!option || used.has(option.value)) continue
    ranked.push(option)
    used.add(option.value)
  }

  for (const practiceId of recommendedPracticeIds) {
    if (selectedSet.has(practiceId) || used.has(practiceId)) continue
    const option = options.find((entry) => entry.value === practiceId)
    if (!option) continue
    ranked.push(option)
    used.add(practiceId)
  }

  for (const option of options) {
    if (used.has(option.value)) continue
    ranked.push(option)
    used.add(option.value)
  }

  return ranked
}

export function rankOrganizationPracticeComboboxOptions<T extends LabelValueDescriptionOption>(
  options: readonly T[],
  query: string,
  selected: readonly string[],
  recommendedPracticeIds: readonly OrganizationPractice[],
): T[] {
  if (query.trim()) {
    return prependSelectedNonMatches(options, rankOptionsByQuery(options, query), selected)
  }
  return rankEmptyQueryOrganizationPractices(options, selected, recommendedPracticeIds)
}
