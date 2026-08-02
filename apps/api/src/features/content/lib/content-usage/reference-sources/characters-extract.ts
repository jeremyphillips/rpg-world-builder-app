import type { ContentUsageBlocker } from '@rpg/contracts'
import type { CharacterRelationship, CharacterRelationshipKind } from '@rpg/contracts'
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
  spells?: Array<{
    spellId?: string
    selection?: { prepared?: boolean }
    access?: { alwaysPrepared?: boolean }
  }>
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

function characterIdFromHit(hit: CharacterContentUsageHit): string {
  return String(hit._id)
}

export function characterHitToRelationship(
  hit: CharacterContentUsageHit,
  kind: CharacterRelationshipKind,
): CharacterRelationship {
  return {
    kind,
    characterId: characterIdFromHit(hit),
    characterName: hit.name,
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

type RelationshipIndexBucket = Map<string, CharacterRelationship>

function bucketForContentId(
  index: Map<string, RelationshipIndexBucket>,
  contentId: string,
): RelationshipIndexBucket {
  const existing = index.get(contentId)
  if (existing) return existing

  const bucket: RelationshipIndexBucket = new Map()
  index.set(contentId, bucket)
  return bucket
}

function indexRelationshipsByContentId<T>(
  records: readonly T[],
  extractIds: (record: T) => readonly string[],
  toRelationship: (record: T) => CharacterRelationship,
): Map<string, CharacterRelationship[]> {
  const index = new Map<string, RelationshipIndexBucket>()

  for (const record of records) {
    const relationship = toRelationship(record)
    const identityKey = relationship.characterId

    for (const contentId of extractIds(record)) {
      const bucket = bucketForContentId(index, contentId)
      if (!bucket.has(identityKey)) {
        bucket.set(identityKey, relationship)
      }
    }
  }

  return new Map(
    [...index.entries()].map(([contentId, bucket]) => [contentId, [...bucket.values()]]),
  )
}

function extractIdsForDescriptor(
  hit: CharacterContentUsageHit,
  descriptor: CharacterContentReferenceDescriptor | 'equipment',
): readonly string[] {
  if (descriptor === 'equipment') {
    return extractEquipmentIdsFromCharacter(hit)
  }
  return extractIdsFromCharacterDescriptor(hit, descriptor)
}

/** Fixed-kind relationships for one character reference descriptor. */
export function indexFixedRelationshipsByContentId(input: {
  hits: readonly CharacterContentUsageHit[]
  descriptor: CharacterContentReferenceDescriptor | 'equipment'
  kind: CharacterRelationshipKind
}): Map<string, CharacterRelationship[]> {
  return indexRelationshipsByContentId(
    input.hits,
    (hit) => extractIdsForDescriptor(hit, input.descriptor),
    (hit) => characterHitToRelationship(hit, input.kind),
  )
}

function resolveSpellRelationshipKind(
  spell: NonNullable<CharacterContentUsageHit['spells']>[number],
): 'prepared' | 'knows' {
  if (spell.selection?.prepared === true || spell.access?.alwaysPrepared === true) {
    return 'prepared'
  }
  return 'knows'
}

/** Spell relationships with prepared/knows kind per character spell entry. */
export function indexSpellRelationshipsByContentId(
  hits: readonly CharacterContentUsageHit[],
): Map<string, CharacterRelationship[]> {
  const index = new Map<string, RelationshipIndexBucket>()

  for (const hit of hits) {
    const characterId = characterIdFromHit(hit)

    for (const spell of hit.spells ?? []) {
      if (typeof spell.spellId !== 'string' || spell.spellId.length === 0) {
        continue
      }

      const kind = resolveSpellRelationshipKind(spell)
      const bucket = bucketForContentId(index, spell.spellId)
      const identityKey = `${characterId}:${kind}`
      if (!bucket.has(identityKey)) {
        bucket.set(identityKey, {
          kind,
          characterId,
          characterName: hit.name,
        })
      }
    }
  }

  return new Map(
    [...index.entries()].map(([contentId, bucket]) => [contentId, [...bucket.values()]]),
  )
}

export function relationshipsForContentEntry(
  index: Map<string, CharacterRelationship[]>,
  entryKey: string,
): CharacterRelationship[] {
  return index.get(entryKey) ?? []
}
