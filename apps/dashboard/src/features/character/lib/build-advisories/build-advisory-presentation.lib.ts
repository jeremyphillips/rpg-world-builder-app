import {
  resolveCharacterBuildAdvisoryMessage,
  characterBuildAdvisoryKey,
  toEquipmentContentId,
  type CharacterBuildAdvisory,
} from '@rpg/contracts'

import type { EntitySummaryStatusText } from '@/features/content'

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

export function buildAdvisoryStatusItems(
  advisories: readonly CharacterBuildAdvisory[],
): EntitySummaryStatusText[] {
  return advisories.map((advisory) => ({
    kind: 'text',
    variant: 'warning',
    label: resolveCharacterBuildAdvisoryMessage(advisory),
  }))
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
