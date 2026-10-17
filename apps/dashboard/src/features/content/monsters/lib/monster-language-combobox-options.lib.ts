export type MonsterLanguageComboboxOption = {
  value: string
  label: string
  metadata?: string
}

export function prepareMonsterLanguageComboboxOptions(input: {
  activeLanguageOptions: readonly MonsterLanguageComboboxOption[]
  selectedLanguageIds: ReadonlySet<string>
  affinityLanguageIds: readonly string[]
  creatureTypeLabel?: string
}): MonsterLanguageComboboxOption[] {
  const { activeLanguageOptions, selectedLanguageIds, affinityLanguageIds, creatureTypeLabel } =
    input

  const unselected = activeLanguageOptions.filter(
    (option) => !selectedLanguageIds.has(option.value),
  )
  const optionById = new Map(unselected.map((option) => [option.value, option]))

  const recommendation =
    creatureTypeLabel && affinityLanguageIds.length > 0
      ? `Recommended by ${creatureTypeLabel}`
      : undefined

  const affinityOptions: MonsterLanguageComboboxOption[] = []
  for (const id of affinityLanguageIds) {
    const option = optionById.get(id)
    if (!option) continue

    affinityOptions.push({
      ...option,
      ...(recommendation && !option.metadata ? { metadata: recommendation } : {}),
    })
    optionById.delete(id)
  }

  const remaining = unselected.filter((option) => optionById.has(option.value))

  if (affinityLanguageIds.length === 0 || !creatureTypeLabel) {
    return unselected
  }

  return [...affinityOptions, ...remaining]
}
