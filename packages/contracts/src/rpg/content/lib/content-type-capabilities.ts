import type { ContentTypeKey } from '../../primitives/content/content-type-keys'
import { MONSTER_ACTION_SECTIONS } from '../monster/action-sections'

/** Nested entry arrays (keyed by stable `id`) that may carry entry provenance. */
export type ProvenanceEntryHostPath = 'actions' | 'bonusActions' | 'reactions' | 'traits'

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
  | 'characterCreation.startingEquipment'

/** Per-type nested authored-id regeneration policy for duplication. */
export type NestedIdRegeneration =
  | typeof noNestedRegenerationRequired
  | { paths: readonly NestedContentIdRegenerationPath[] }

export interface ContentTypeCapability {
  canDuplicate: boolean
  nestedIdRegeneration: NestedIdRegeneration
  /** Empty when the type has not opted into entry provenance. */
  provenanceEntryHosts: readonly ProvenanceEntryHostPath[]
}

const noProvenanceHosts = [] as const satisfies readonly ProvenanceEntryHostPath[]

/**
 * Duplication capability registry — sibling to `CONTENT_ACCESS_CAPABILITIES`.
 * API route dispatch and dashboard Duplicate visibility both derive from this map.
 */
export const CONTENT_TYPE_CAPABILITIES: Record<ContentTypeKey, ContentTypeCapability> = {
  classes: {
    canDuplicate: true,
    nestedIdRegeneration: { paths: ['features', 'characterCreation.startingEquipment'] },
    provenanceEntryHosts: noProvenanceHosts,
  },
  spells: {
    canDuplicate: true,
    nestedIdRegeneration: { paths: ['resolution'] },
    provenanceEntryHosts: noProvenanceHosts,
  },
  species: {
    canDuplicate: true,
    nestedIdRegeneration: { paths: ['traits', 'heritage'] },
    provenanceEntryHosts: noProvenanceHosts,
  },
  feats: {
    canDuplicate: true,
    nestedIdRegeneration: noNestedRegenerationRequired,
    provenanceEntryHosts: noProvenanceHosts,
  },
  equipment: {
    canDuplicate: true,
    nestedIdRegeneration: noNestedRegenerationRequired,
    provenanceEntryHosts: noProvenanceHosts,
  },
  'skill-proficiencies': {
    canDuplicate: true,
    nestedIdRegeneration: noNestedRegenerationRequired,
    provenanceEntryHosts: noProvenanceHosts,
  },
  organizations: {
    canDuplicate: true,
    nestedIdRegeneration: { paths: ['connections.locations', 'members.titles'] },
    provenanceEntryHosts: noProvenanceHosts,
  },
  locations: {
    canDuplicate: true,
    nestedIdRegeneration: noNestedRegenerationRequired,
    provenanceEntryHosts: noProvenanceHosts,
  },
  monsters: {
    canDuplicate: true,
    nestedIdRegeneration: noNestedRegenerationRequired,
    provenanceEntryHosts: [...MONSTER_ACTION_SECTIONS, 'traits'],
  },
}

export function canDuplicateContentType(contentType: ContentTypeKey): boolean {
  return CONTENT_TYPE_CAPABILITIES[contentType].canDuplicate
}

export function provenanceEntryHostsFor(
  contentType: ContentTypeKey,
): readonly ProvenanceEntryHostPath[] {
  return CONTENT_TYPE_CAPABILITIES[contentType].provenanceEntryHosts
}

/** Reads one registered host. Paths are a closed switch, not a generic walk. */
export function readProvenanceHostEntries(
  body: Record<string, unknown>,
  path: ProvenanceEntryHostPath,
): unknown {
  switch (path) {
    case 'actions':
      return body.actions
    case 'bonusActions':
      return body.bonusActions
    case 'reactions':
      return body.reactions
    case 'traits':
      return body.traits
  }
}

export function writeProvenanceHostEntries(
  body: Record<string, unknown>,
  path: ProvenanceEntryHostPath,
  entries: unknown,
): Record<string, unknown> {
  switch (path) {
    case 'actions':
      return { ...body, actions: entries }
    case 'bonusActions':
      return { ...body, bonusActions: entries }
    case 'reactions':
      return { ...body, reactions: entries }
    case 'traits':
      return { ...body, traits: entries }
  }
}
