import {
  CHARACTER_RELATIONSHIP_KIND_ORDER,
  CONTENT_USAGE_SUMMARY_LIMIT,
  viewerCharacterRelationshipsSchema,
  type CharacterRelationship,
  type CharacterRelationshipKind,
  type ViewerCharacterRelationships,
} from '@rpg/contracts'

import { getContentUsageRegistration } from './content-usage-registrations'
import type { ContentUsageSurfaceKey } from './define-content-usage'
import type { ContentUsageResolverContext } from './content-usage-context'
import { resolveContentUsageLookupKey } from './content-usage-resolvers'
import {
  indexFixedRelationshipsByContentId,
  indexSpellRelationshipsByContentId,
  relationshipsForContentEntry,
} from './reference-sources/characters-extract'
import { loadControlledCharacterHits } from './reference-sources/characters'

function sortRelationships(
  relationships: readonly CharacterRelationship[],
): CharacterRelationship[] {
  return [...relationships].sort((left, right) => {
    const kindCompare =
      CHARACTER_RELATIONSHIP_KIND_ORDER[left.kind] - CHARACTER_RELATIONSHIP_KIND_ORDER[right.kind]
    if (kindCompare !== 0) {
      return kindCompare
    }
    return left.characterName.localeCompare(right.characterName)
  })
}

function buildGroupedEnvelope(
  relationships: readonly CharacterRelationship[],
  presentation?: ViewerCharacterRelationships['presentation'],
): ViewerCharacterRelationships | undefined {
  if (relationships.length === 0) {
    return undefined
  }

  const byKind = new Map<CharacterRelationshipKind, CharacterRelationship[]>()
  for (const relationship of sortRelationships(relationships)) {
    const group = byKind.get(relationship.kind) ?? []
    group.push(relationship)
    byKind.set(relationship.kind, group)
  }

  const groups = [...byKind.entries()]
    .sort(
      ([leftKind], [rightKind]) =>
        CHARACTER_RELATIONSHIP_KIND_ORDER[leftKind] - CHARACTER_RELATIONSHIP_KIND_ORDER[rightKind],
    )
    .map(([kind, kindRelationships]) => ({
      kind,
      count: kindRelationships.length,
      relationships: kindRelationships.slice(0, CONTENT_USAGE_SUMMARY_LIMIT),
    }))

  const envelope = {
    groups,
    count: groups.reduce((sum, group) => sum + group.count, 0),
    ...(presentation ? { presentation } : {}),
  }

  return viewerCharacterRelationshipsSchema.parse(envelope)
}

function batchCharacterReferenceFromRegistration(
  contentType: ContentUsageSurfaceKey,
): NonNullable<
  ReturnType<typeof getContentUsageRegistration>['sources'][number]['source']['characterReference']
> {
  const registration = getContentUsageRegistration(contentType)
  const batchSource = registration.sources.find((source) => source.batch)?.source
  const characterReference = batchSource?.characterReference

  if (!characterReference) {
    throw new Error(
      `Missing characterReference on batch source for "${contentType}" viewer relationship enrichment.`,
    )
  }

  return characterReference
}

async function buildRelationshipIndex(
  ctx: ContentUsageResolverContext,
  contentType: ContentUsageSurfaceKey,
): Promise<Map<string, CharacterRelationship[]>> {
  const registration = getContentUsageRegistration(contentType)
  const strategy = registration.viewerCharacterRelationship
  const controlledCharacterIds = ctx.viewer?.controlledCharacterIds ?? []

  if (strategy.strategy === 'none' || controlledCharacterIds.length === 0) {
    return new Map()
  }

  const characterReference = batchCharacterReferenceFromRegistration(contentType)

  if (strategy.strategy === 'spell-selection') {
    const hits = await loadControlledCharacterHits(
      controlledCharacterIds,
      characterReference,
      ctx.controlledCharacterHitCache,
    )
    return indexSpellRelationshipsByContentId(hits)
  }

  const hits = await loadControlledCharacterHits(
    controlledCharacterIds,
    characterReference,
    ctx.controlledCharacterHitCache,
  )
  return indexFixedRelationshipsByContentId({
    hits,
    descriptor: characterReference,
    kind: strategy.kind,
  })
}

function presentationForRelationships(
  relationships: readonly CharacterRelationship[],
  contentType: ContentUsageSurfaceKey,
): ViewerCharacterRelationships['presentation'] | undefined {
  const registration = getContentUsageRegistration(contentType)
  const strategy = registration.viewerCharacterRelationship

  if (strategy.strategy !== 'fixed' || strategy.kind !== 'has') {
    return undefined
  }

  if (!relationships.some((relationship) => relationship.kind === 'has')) {
    return undefined
  }

  return { hasNoun: strategy.hasNoun }
}

/** Batch viewer-controlled PC relationships for list rows and search documents. */
export async function resolveViewerCharacterRelationships(
  ctx: ContentUsageResolverContext,
  contentType: ContentUsageSurfaceKey,
  entities: readonly { id: string; slug: string }[],
): Promise<Map<string, ViewerCharacterRelationships | undefined>> {
  const index = await buildRelationshipIndex(ctx, contentType)
  const results = new Map<string, ViewerCharacterRelationships | undefined>()

  for (const entity of entities) {
    const entryKey = resolveContentUsageLookupKey(contentType, entity)
    const relationships = relationshipsForContentEntry(index, entryKey)
    const presentation = presentationForRelationships(relationships, contentType)
    const envelope = buildGroupedEnvelope(relationships, presentation)
    results.set(entryKey, envelope)
  }

  return results
}

export async function attachViewerCharacterRelationships<T extends { id: string; slug: string }>(
  ctx: ContentUsageResolverContext,
  contentType: ContentUsageSurfaceKey,
  items: readonly T[],
): Promise<(T & { viewerCharacterRelationships?: ViewerCharacterRelationships })[]> {
  const registration = getContentUsageRegistration(contentType)
  if (registration.viewerCharacterRelationship.strategy === 'none') {
    return [...items]
  }

  const controlledCharacterIds = ctx.viewer?.controlledCharacterIds ?? []
  if (controlledCharacterIds.length === 0) {
    return [...items]
  }

  const relationshipMap = await resolveViewerCharacterRelationships(ctx, contentType, items)

  return items.map((item) => {
    const entryKey = resolveContentUsageLookupKey(contentType, item)
    const viewerCharacterRelationships = relationshipMap.get(entryKey)
    return viewerCharacterRelationships ? { ...item, viewerCharacterRelationships } : { ...item }
  })
}
