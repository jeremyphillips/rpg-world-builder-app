import type { ContentUsageBlocker } from '@rpg/contracts'
import {
  CHARACTER_EQUIPMENT_INVENTORY_BUCKETS,
  type CharacterContentReferenceDescriptor,
} from '@rpg/contracts'

/** Minimal lean character shape used by content-usage extractors. */
export type CharacterContentUsageHit = {
  _id: unknown
  name: string
  characterType: 'pc' | 'npc'
  classes?: Array<{ classId?: string; subclassId?: string }>
  species?: { id?: string }
  spells?: Array<{ spellId?: string }>
  feats?: Array<{ featId?: string }>
  equipment?: Partial<
    Record<(typeof CHARACTER_EQUIPMENT_INVENTORY_BUCKETS)[number], Array<{ equipmentId?: string }>>
  >
  connections?: {
    organizations?: Array<{ organizationId?: string }>
  }
  proficiencies?: {
    skills?: Array<{ skill?: string }>
  }
}

export function characterHitToUsageBlocker(
  hit: CharacterContentUsageHit,
  campaignId: string,
): ContentUsageBlocker {
  return {
    kind: 'usage',
    usage: {
      kind: 'character',
      id: String(hit._id),
      label: hit.name,
      characterType: hit.characterType,
      ...(hit.characterType === 'npc' ? { campaignId } : {}),
    },
  }
}

function nonEmptyStrings(values: readonly (string | undefined)[]): readonly string[] {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0)
}

const CHARACTER_DESCRIPTOR_EXTRACTORS: Record<
  string,
  (hit: CharacterContentUsageHit) => readonly string[]
> = {
  'classes.classId': (hit) => nonEmptyStrings((hit.classes ?? []).map((entry) => entry.classId)),
  'classes.subclassId': (hit) =>
    nonEmptyStrings((hit.classes ?? []).map((entry) => entry.subclassId)),
  'species.id': (hit) => (hit.species?.id ? [hit.species.id] : []),
  'spells.spellId': (hit) => nonEmptyStrings((hit.spells ?? []).map((entry) => entry.spellId)),
  'feats.featId': (hit) => nonEmptyStrings((hit.feats ?? []).map((entry) => entry.featId)),
  'connections.organizations.organizationId': (hit) =>
    nonEmptyStrings((hit.connections?.organizations ?? []).map((entry) => entry.organizationId)),
  'proficiencies.skills.skill': (hit) =>
    nonEmptyStrings((hit.proficiencies?.skills ?? []).map((entry) => entry.skill)),
}

/** Extract referenced values along a single character path descriptor. */
export function extractIdsFromCharacterDescriptor(
  hit: CharacterContentUsageHit,
  descriptor: CharacterContentReferenceDescriptor,
): readonly string[] {
  const extract = CHARACTER_DESCRIPTOR_EXTRACTORS[descriptor.path]
  if (!extract) {
    throw new Error(`Unsupported character content reference path: ${descriptor.path}`)
  }
  return extract(hit)
}

/** Extract equipment catalog ids from all inventory buckets. */
export function extractEquipmentIdsFromCharacter(hit: CharacterContentUsageHit): readonly string[] {
  const ids: string[] = []
  for (const bucket of CHARACTER_EQUIPMENT_INVENTORY_BUCKETS) {
    for (const entry of hit.equipment?.[bucket] ?? []) {
      if (typeof entry.equipmentId === 'string' && entry.equipmentId.length > 0) {
        ids.push(entry.equipmentId)
      }
    }
  }
  return ids
}
