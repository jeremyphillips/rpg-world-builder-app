import { isArmorEquipment, type Equipment } from '../../../content/equipment'
import { getNpcTemplateEntry } from '../../../vocab/npc/npc-template'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { isBuilderLevelZeroClassless } from '../progression/character-level-policy'
import { deriveEquipmentDraftEntries } from '../resolvers/equipment/derive-equipment-draft-entries'
import { addOptionIdentityKeys, optionIdentityKeys } from '../option-identity'
import type { NpcRecommendationSource } from '../sourced-recommendation'

export type NpcEquipmentPreferenceKind = 'weapon' | 'armor'

/** Lower `sourcePriority` and lower `index` win. Title rank is reserved for a future pass. */
export const NPC_EQUIPMENT_PREFERENCE_SOURCE_PRIORITY = {
  user: 0,
  title: 1,
  template: 2,
} as const satisfies Partial<Record<NpcRecommendationSource, number>>

export type NpcEquipmentPreferenceEntry = {
  readonly kind: NpcEquipmentPreferenceKind
  readonly slug: string
  readonly source: NpcRecommendationSource
  readonly sourcePriority: number
  readonly index: number
}

export type EquipmentPreferenceTuple = readonly [sourcePriority: number, index: number]

export const NO_EQUIPMENT_PREFERENCE_MATCH: EquipmentPreferenceTuple = [
  Number.MAX_SAFE_INTEGER,
  Number.MAX_SAFE_INTEGER,
]

export function buildEquipmentPreferenceStream(args: {
  userWeaponSlugs?: readonly string[]
  userArmorSlugs?: readonly string[]
  templateWeaponSlugs?: readonly string[]
  templateArmorSlugs?: readonly string[]
}): NpcEquipmentPreferenceEntry[] {
  const entries: NpcEquipmentPreferenceEntry[] = []

  function append(
    kind: NpcEquipmentPreferenceKind,
    slugs: readonly string[],
    source: NpcRecommendationSource,
    sourcePriority: number,
  ): void {
    slugs.forEach((slug, index) => {
      entries.push({ kind, slug, source, sourcePriority, index })
    })
  }

  append(
    'weapon',
    args.userWeaponSlugs ?? [],
    'user',
    NPC_EQUIPMENT_PREFERENCE_SOURCE_PRIORITY.user,
  )
  append('armor', args.userArmorSlugs ?? [], 'user', NPC_EQUIPMENT_PREFERENCE_SOURCE_PRIORITY.user)
  append(
    'weapon',
    args.templateWeaponSlugs ?? [],
    'template',
    NPC_EQUIPMENT_PREFERENCE_SOURCE_PRIORITY.template,
  )
  append(
    'armor',
    args.templateArmorSlugs ?? [],
    'template',
    NPC_EQUIPMENT_PREFERENCE_SOURCE_PRIORITY.template,
  )

  return entries
}

export function equipmentPreferenceTuple(
  entry: NpcEquipmentPreferenceEntry,
): EquipmentPreferenceTuple {
  return [entry.sourcePriority, entry.index]
}

export function compareEquipmentPreferenceTuples(
  left: EquipmentPreferenceTuple,
  right: EquipmentPreferenceTuple,
): number {
  if (left[0] !== right[0]) return left[0] - right[0]
  return left[1] - right[1]
}

function equipmentKindForPreference(
  equipment: Equipment | undefined,
): NpcEquipmentPreferenceKind | undefined {
  if (!equipment) return undefined
  if (equipment.kind === 'weapon') return 'weapon'
  if (isArmorEquipment(equipment)) return 'armor'
  return undefined
}

export function preferenceEntryMatchesEquipmentId(
  entry: NpcEquipmentPreferenceEntry,
  equipmentId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): boolean {
  if (entry.kind === 'weapon') {
    const equipment = catalogIndex.equipment.get(equipmentId)
    if (!equipment || equipment.kind !== 'weapon') return false
  } else {
    const equipment = catalogIndex.equipment.get(equipmentId)
    if (!equipment || !isArmorEquipment(equipment)) return false
  }
  return optionIdentityKeys(equipmentId).includes(entry.slug)
}

export function collectHeldEquipmentSlugKeys(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  context?: CharacterBuildContext
}): Set<string> {
  const keys = new Set<string>()
  const inventory = deriveEquipmentDraftEntries(args.draft, args.catalogIndex)
  for (const bucket of Object.values(inventory)) {
    for (const entry of bucket) {
      addOptionIdentityKeys(keys, entry.equipmentId)
    }
  }

  if (
    args.context &&
    isBuilderLevelZeroClassless(args.draft, args.context) &&
    args.draft.npcTemplateId
  ) {
    const kit = getNpcTemplateEntry(args.draft.npcTemplateId)?.levelZero?.kit ?? []
    for (const item of kit) keys.add(item.slug)
  }

  return keys
}

export function filterHeldEquipmentPreferences(
  stream: readonly NpcEquipmentPreferenceEntry[],
  heldSlugKeys: ReadonlySet<string>,
): NpcEquipmentPreferenceEntry[] {
  if (heldSlugKeys.size === 0) return [...stream]
  return stream.filter((entry) => !heldSlugKeys.has(entry.slug))
}

export type EquipmentPreferenceMatch = {
  tuple: EquipmentPreferenceTuple
  entry: NpcEquipmentPreferenceEntry
}

export function bestEquipmentPreferenceMatchForEquipmentId(args: {
  equipmentId: string
  stream: readonly NpcEquipmentPreferenceEntry[]
  catalogIndex: CharacterBuildCatalogIndex
}): EquipmentPreferenceMatch | undefined {
  const equipment = args.catalogIndex.equipment.get(args.equipmentId)
  const kind = equipmentKindForPreference(equipment)
  if (!kind) return undefined

  let best: EquipmentPreferenceMatch | undefined
  for (const entry of args.stream) {
    if (entry.kind !== kind) continue
    if (!preferenceEntryMatchesEquipmentId(entry, args.equipmentId, args.catalogIndex)) continue
    const tuple = equipmentPreferenceTuple(entry)
    if (!best || compareEquipmentPreferenceTuples(tuple, best.tuple) < 0) {
      best = { tuple, entry }
    }
  }
  return best
}

export function bestEquipmentPreferenceMatchForReachableIds(args: {
  equipmentIds: readonly string[]
  stream: readonly NpcEquipmentPreferenceEntry[]
  catalogIndex: CharacterBuildCatalogIndex
}): EquipmentPreferenceMatch | undefined {
  let best: EquipmentPreferenceMatch | undefined
  for (const equipmentId of args.equipmentIds) {
    const match = bestEquipmentPreferenceMatchForEquipmentId({
      equipmentId,
      stream: args.stream,
      catalogIndex: args.catalogIndex,
    })
    if (!match) continue
    if (!best || compareEquipmentPreferenceTuples(match.tuple, best.tuple) < 0) {
      best = match
    }
  }
  return best
}

/** Sources to record when exactly one recommendation source owns the winning tuple. */
export function suggestedSourcesForEquipmentPreferenceMatch(
  stream: readonly NpcEquipmentPreferenceEntry[],
  catalogIndex: CharacterBuildCatalogIndex,
  match: EquipmentPreferenceMatch | undefined,
  reachableEquipmentIds: readonly string[],
): readonly NpcRecommendationSource[] {
  if (!match) return []

  const owners = new Set<NpcRecommendationSource>()
  for (const equipmentId of reachableEquipmentIds) {
    for (const entry of stream) {
      if (entry.kind !== match.entry.kind) continue
      if (equipmentPreferenceTuple(entry)[0] !== match.tuple[0]) continue
      if (equipmentPreferenceTuple(entry)[1] !== match.tuple[1]) continue
      if (!preferenceEntryMatchesEquipmentId(entry, equipmentId, catalogIndex)) continue
      owners.add(entry.source)
    }
  }

  if (owners.size !== 1) return []
  return [owners.values().next().value!]
}
