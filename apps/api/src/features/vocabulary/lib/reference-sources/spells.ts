function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function extractSpellSchoolId(record: { school?: string }): readonly string[] {
  return typeof record.school === 'string' ? [record.school] : []
}

export function extractSpellConditionIds(record: {
  tags?: { conditions?: readonly string[] }
}): readonly string[] {
  return record.tags?.conditions ?? []
}

function collectDamageTypesFromResolution(resolution: unknown, ids: Set<string>): void {
  if (!isRecord(resolution) || !Array.isArray(resolution.effects)) return

  for (const effect of resolution.effects) {
    if (!isRecord(effect) || effect.kind !== 'damage') continue
    if (typeof effect.damageType === 'string') {
      ids.add(effect.damageType)
    }
  }
}

export function extractSpellDamageTypeIds(record: Record<string, unknown>): readonly string[] {
  const ids = new Set<string>()

  const tags = record.tags
  if (isRecord(tags) && Array.isArray(tags.damageTypes)) {
    for (const id of tags.damageTypes) {
      if (typeof id === 'string') ids.add(id)
    }
  }

  collectDamageTypesFromResolution(record.resolution, ids)

  return [...ids]
}
