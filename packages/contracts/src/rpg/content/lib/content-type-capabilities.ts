import type { ContentTypeKey } from './content-type-keys'

/** Per-type nested authored-id regeneration policy for duplication. */
export type NestedIdRegeneration = 'none' | { paths: readonly string[] }

export interface ContentTypeCapability {
  canDuplicate: boolean
  nestedIdRegeneration: NestedIdRegeneration
}

/** Explicit opt-out when a duplicable type has no nested authored ids to regenerate. */
export const noNestedRegenerationRequired = 'none' as const

/**
 * Duplication capability registry — sibling to `CONTENT_ACCESS_CAPABILITIES`.
 * API route dispatch and dashboard Duplicate visibility both derive from this map.
 */
export const CONTENT_TYPE_CAPABILITIES: Record<ContentTypeKey, ContentTypeCapability> = {
  classes: {
    canDuplicate: true,
    nestedIdRegeneration: { paths: ['features'] },
  },
  spells: {
    canDuplicate: true,
    nestedIdRegeneration: { paths: ['resolution'] },
  },
  species: {
    canDuplicate: true,
    nestedIdRegeneration: { paths: ['traits', 'heritage'] },
  },
  feats: {
    canDuplicate: true,
    nestedIdRegeneration: noNestedRegenerationRequired,
  },
  equipment: {
    canDuplicate: true,
    nestedIdRegeneration: noNestedRegenerationRequired,
  },
  'skill-proficiencies': {
    canDuplicate: true,
    nestedIdRegeneration: noNestedRegenerationRequired,
  },
  organizations: {
    canDuplicate: true,
    nestedIdRegeneration: noNestedRegenerationRequired,
  },
  locations: {
    canDuplicate: true,
    nestedIdRegeneration: { paths: ['partyAssociations'] },
  },
}

export function canDuplicateContentType(contentType: ContentTypeKey): boolean {
  return CONTENT_TYPE_CAPABILITIES[contentType].canDuplicate
}
