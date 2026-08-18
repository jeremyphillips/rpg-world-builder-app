import type { ContentTypeKey } from '../../primitives/content/content-type-keys'

/** Explicit opt-out when a duplicable type has no nested authored ids to regenerate. */
export const noNestedRegenerationRequired = 'none' as const

/** Nested paths with duplicate-time id regeneration handlers. */
export type NestedContentIdRegenerationPath =
  | 'features'
  | 'traits'
  | 'heritage'
  | 'resolution'
  | 'connections.locations'
  | 'members.titles'

/** Per-type nested authored-id regeneration policy for duplication. */
export type NestedIdRegeneration =
  | typeof noNestedRegenerationRequired
  | { paths: readonly NestedContentIdRegenerationPath[] }

export interface ContentTypeCapability {
  canDuplicate: boolean
  nestedIdRegeneration: NestedIdRegeneration
}

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
    nestedIdRegeneration: { paths: ['connections.locations', 'members.titles'] },
  },
  locations: {
    canDuplicate: true,
    nestedIdRegeneration: noNestedRegenerationRequired,
  },
}

export function canDuplicateContentType(contentType: ContentTypeKey): boolean {
  return CONTENT_TYPE_CAPABILITIES[contentType].canDuplicate
}
