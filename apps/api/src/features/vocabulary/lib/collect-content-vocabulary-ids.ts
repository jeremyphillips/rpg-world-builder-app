import { flattenGrantGroups, resolveGrantGroupsFromContent } from '@rpg/contracts'
import type { ContentGrant, GrantGroups } from '@rpg/contracts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function addIds(ids: readonly string[], target: Set<string>): void {
  for (const id of ids) target.add(id)
}

function collectSenseVocabulary(
  grant: Extract<ContentGrant, { kind: 'sense' }>,
  senseIds: Set<string>,
): void {
  senseIds.add(grant.type)
}

function collectDamageVocabulary(
  grant: Extract<ContentGrant, { kind: 'resistances' | 'damageType' }>,
  damageIds: Set<string>,
): void {
  addIds(grant.damageTypes, damageIds)
}

function collectLanguageVocabulary(
  grant: Extract<ContentGrant, { kind: 'languages' }>,
  languageIds: Set<string>,
): void {
  addIds(grant.languageIds, languageIds)
}

function collectLanguageChoiceVocabulary(
  grant: Extract<ContentGrant, { kind: 'languageChoice' }>,
  languageIds: Set<string>,
): void {
  if (grant.from) addIds(grant.from, languageIds)
}

function collectVocabularyIdsFromGrant(
  grant: ContentGrant,
  damageIds: Set<string>,
  senseIds: Set<string>,
  languageIds: Set<string>,
): void {
  switch (grant.kind) {
    case 'sense':
      collectSenseVocabulary(grant, senseIds)
      break
    case 'resistances':
    case 'damageType':
      collectDamageVocabulary(grant, damageIds)
      break
    case 'languages':
      collectLanguageVocabulary(grant, languageIds)
      break
    case 'languageChoice':
      collectLanguageChoiceVocabulary(grant, languageIds)
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

/** Collects damage type ids referenced in species-like content body fields. */
export function collectDamageTypeIdsFromBody(body: Record<string, unknown>): string[] {
  const ids = new Set<string>()
  collectFromTraits(body.traits, ids, new Set(), new Set())
  collectFromHeritage(body.heritage, ids, new Set(), new Set())
  return [...ids]
}

/** Collects sense type ids referenced in species-like content body fields. */
export function collectSenseTypeIdsFromBody(body: Record<string, unknown>): string[] {
  const ids = new Set<string>()
  collectFromTraits(body.traits, new Set(), ids, new Set())
  collectFromHeritage(body.heritage, new Set(), ids, new Set())
  return [...ids]
}

/** Collects language ids referenced in species-like content body fields. */
export function collectLanguageIdsFromBody(body: Record<string, unknown>): string[] {
  const ids = new Set<string>()
  collectFromTraits(body.traits, new Set(), new Set(), ids)
  collectFromHeritage(body.heritage, new Set(), new Set(), ids)
  return [...ids]
}

/** Collects damage type ids from spell tag fields. */
export function collectDamageTypeIdsFromSpellBody(body: Record<string, unknown>): string[] {
  const tags = body.tags
  if (!isRecord(tags) || !Array.isArray(tags.damageTypes)) return []
  return tags.damageTypes.filter((id): id is string => typeof id === 'string')
}

/** Collects the spell school id from a spell body. */
export function collectSpellSchoolIdFromSpellBody(body: Record<string, unknown>): string[] {
  const school = body.school
  return typeof school === 'string' ? [school] : []
}
