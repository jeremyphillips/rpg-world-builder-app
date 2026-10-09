import {
  resolveCharacterBuildAdvisoryMessage,
  characterBuildAdvisoryKey,
  toEquipmentContentId,
  type CharacterBuildAdvisory,
} from '@rpg/contracts'

export type BuildAdvisoryListItem = {
  key: string
  title?: string
  message: string
}

function advisoryTitle(advisory: CharacterBuildAdvisory): string | undefined {
  switch (advisory.code) {
    case 'equipment_not_proficient':
    case 'equipment_ability_score_requirement_unmet':
      return advisory.subject.label
  }
}

function advisoryEquipmentId(advisory: CharacterBuildAdvisory): string | undefined {
  switch (advisory.code) {
    case 'equipment_not_proficient':
    case 'equipment_ability_score_requirement_unmet':
      return advisory.subject.equipmentId
  }
}

/** Equipment-subject advisories keyed by equipment id, for inventory row lookup. */
export function indexBuildAdvisoriesByEquipmentId(
  advisories: readonly CharacterBuildAdvisory[],
): ReadonlyMap<string, CharacterBuildAdvisory[]> {
  const index = new Map<string, CharacterBuildAdvisory[]>()
  for (const advisory of advisories) {
    const equipmentId = advisoryEquipmentId(advisory)
    if (!equipmentId) continue
    index.set(equipmentId, [...(index.get(equipmentId) ?? []), advisory])
  }
  return index
}

/** Looks up advisories for an equipment id, tolerating slug-form ids. */
export function lookupBuildAdvisoriesForEquipment(
  index: ReadonlyMap<string, CharacterBuildAdvisory[]>,
  equipmentId: string,
  rulesetId?: string,
): CharacterBuildAdvisory[] {
  const direct = index.get(equipmentId)
  if (direct) return direct
  if (!rulesetId) return []
  return index.get(toEquipmentContentId(rulesetId, equipmentId)) ?? []
}

/** Player-facing advisory sentence. Summary cards use this; rows use selection status. */
export function formatBuildAdvisoryLabel(advisory: CharacterBuildAdvisory): string {
  return resolveCharacterBuildAdvisoryMessage(advisory)
}

/** Ordered title/message pairs for alerts and the create confirmation. */
export function presentBuildAdvisoryList(
  advisories: readonly CharacterBuildAdvisory[],
): BuildAdvisoryListItem[] {
  return advisories.map((advisory) => ({
    key: characterBuildAdvisoryKey(advisory),
    title: advisoryTitle(advisory),
    message: resolveCharacterBuildAdvisoryMessage(advisory),
  }))
}
