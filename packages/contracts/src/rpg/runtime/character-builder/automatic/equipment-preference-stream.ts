import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { deriveEquipmentDraftEntries } from '../resolvers/equipment/derive-equipment-draft-entries'
import { addOptionIdentityKeys, optionIdentityKeys } from '../option-identity'
import type { NpcRecommendationSource } from '../sourced-recommendation'

/** Lower `sourcePriority` and lower `index` win. */
export const NPC_EQUIPMENT_PREFERENCE_SOURCE_PRIORITY = {
  user: 0,
  title: 1,
  template: 2,
} as const satisfies Partial<Record<NpcRecommendationSource, number>>

export type NpcEquipmentPreferenceEntry = {
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
  userSlugs?: readonly string[]
  titleSlugs?: readonly string[]
  templateSlugs?: readonly string[]
}): NpcEquipmentPreferenceEntry[] {
  const entries: NpcEquipmentPreferenceEntry[] = []

  function append(
    slugs: readonly string[],
    source: NpcRecommendationSource,
    sourcePriority: number,
  ): void {
    slugs.forEach((slug, index) => {
      entries.push({ slug, source, sourcePriority, index })
    })
  }

  append(args.userSlugs ?? [], 'user', NPC_EQUIPMENT_PREFERENCE_SOURCE_PRIORITY.user)
  append(args.titleSlugs ?? [], 'title', NPC_EQUIPMENT_PREFERENCE_SOURCE_PRIORITY.title)
  append(args.templateSlugs ?? [], 'template', NPC_EQUIPMENT_PREFERENCE_SOURCE_PRIORITY.template)

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

export function preferenceEntryMatchesEquipmentId(
  entry: NpcEquipmentPreferenceEntry,
  equipmentId: string,
): boolean {
  return optionIdentityKeys(equipmentId).includes(entry.slug)
}

/** Slugs already in draft inventory. Catalog defaults are not held until materialized. */
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
  let best: EquipmentPreferenceMatch | undefined
  for (const entry of args.stream) {
    if (!preferenceEntryMatchesEquipmentId(entry, args.equipmentId)) continue
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

const SUGGESTED_SOURCE_ORDER = [
  'user',
  'title',
  'organization',
  'template',
  'species',
  'campaign',
] as const satisfies readonly NpcRecommendationSource[]

/** Every source that owns the winning tuple, in source-priority order. */
export function suggestedSourcesForEquipmentPreferenceMatch(
  stream: readonly NpcEquipmentPreferenceEntry[],
  match: EquipmentPreferenceMatch | undefined,
  reachableEquipmentIds: readonly string[],
): readonly NpcRecommendationSource[] {
  if (!match) return []

  const owners = new Set<NpcRecommendationSource>()
  for (const equipmentId of reachableEquipmentIds) {
    for (const entry of stream) {
      if (equipmentPreferenceTuple(entry)[0] !== match.tuple[0]) continue
      if (equipmentPreferenceTuple(entry)[1] !== match.tuple[1]) continue
      if (!preferenceEntryMatchesEquipmentId(entry, equipmentId)) continue
      owners.add(entry.source)
    }
  }

  return [...owners].sort(
    (left, right) => SUGGESTED_SOURCE_ORDER.indexOf(left) - SUGGESTED_SOURCE_ORDER.indexOf(right),
  )
}
