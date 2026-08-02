import { flattenGrantGroups, resolveGrantGroupsFromContent } from '@rpg/contracts'
import type { ContentGrant, GrantGroups } from '@rpg/contracts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function addIds(ids: readonly string[], target: Set<string>): void {
  for (const id of ids) target.add(id)
}

function collectVocabularyIdsFromGrant(
  grant: ContentGrant,
  damageIds: Set<string>,
  senseIds: Set<string>,
  languageIds: Set<string>,
): void {
  switch (grant.kind) {
    case 'sense':
      senseIds.add(grant.type)
      break
    case 'resistances':
    case 'damageType':
      addIds(grant.damageTypes, damageIds)
      break
    case 'languages':
      addIds(grant.languageIds, languageIds)
      break
    case 'languageChoice':
      if (grant.from) addIds(grant.from, languageIds)
      break
  }
}

function collectFromTrait(
  trait: unknown,
  damageIds: Set<string>,
  senseIds: Set<string>,
  languageIds: Set<string>,
): void {
  if (!isRecord(trait)) return

  const groups = resolveGrantGroupsFromContent(
    {
      kind: String(trait.kind ?? 'custom'),
      grantGroups: trait.grantGroups as GrantGroups | undefined,
    },
    { level: 1 },
  )

  for (const { grant } of flattenGrantGroups(groups)) {
    collectVocabularyIdsFromGrant(grant, damageIds, senseIds, languageIds)
  }
}

function collectFromTraits(
  traits: unknown,
  damageIds: Set<string>,
  senseIds: Set<string>,
  languageIds: Set<string>,
): void {
  if (!Array.isArray(traits)) return
  for (const trait of traits) {
    collectFromTrait(trait, damageIds, senseIds, languageIds)
  }
}

function collectFromHeritage(
  heritage: unknown,
  damageIds: Set<string>,
  senseIds: Set<string>,
  languageIds: Set<string>,
): void {
  if (!isRecord(heritage) || !Array.isArray(heritage.options)) return
  for (const option of heritage.options) {
    collectFromTrait(option, damageIds, senseIds, languageIds)
  }
}

function collectLanguageAffinitiesFromBody(
  body: Record<string, unknown>,
  languageIds: Set<string>,
): void {
  const affinities = body.languageAffinities
  if (!Array.isArray(affinities)) return
  for (const id of affinities) {
    if (typeof id === 'string') languageIds.add(id)
  }
}

export function extractSpeciesCreatureTypeId(record: { creatureType: string }): readonly string[] {
  return [record.creatureType]
}

export function extractSpeciesSizeIds(record: { sizes?: readonly string[] }): readonly string[] {
  return record.sizes ?? []
}

export function extractSpeciesDamageTypeIds(body: Record<string, unknown>): readonly string[] {
  const ids = new Set<string>()
  collectFromTraits(body.traits, ids, new Set(), new Set())
  collectFromHeritage(body.heritage, ids, new Set(), new Set())
  return [...ids]
}

export function extractSpeciesSenseTypeIds(body: Record<string, unknown>): readonly string[] {
  const ids = new Set<string>()
  collectFromTraits(body.traits, new Set(), ids, new Set())
  collectFromHeritage(body.heritage, new Set(), ids, new Set())
  return [...ids]
}

export function extractSpeciesLanguageIds(body: Record<string, unknown>): readonly string[] {
  const ids = new Set<string>()
  collectFromTraits(body.traits, new Set(), new Set(), ids)
  collectFromHeritage(body.heritage, new Set(), new Set(), ids)
  collectLanguageAffinitiesFromBody(body, ids)
  return [...ids]
}

export function extractSpeciesDamageTypeIdsFromRecord(
  record: Record<string, unknown>,
): readonly string[] {
  return extractSpeciesDamageTypeIds(record)
}

export function extractSpeciesSenseTypeIdsFromRecord(
  record: Record<string, unknown>,
): readonly string[] {
  return extractSpeciesSenseTypeIds(record)
}

export function extractSpeciesLanguageIdsFromRecord(
  record: Record<string, unknown>,
): readonly string[] {
  return extractSpeciesLanguageIds(record)
}
