import {
  CHARACTER_LOCATION_CONNECTION_ENTRIES,
  type CharacterLocationConnectionKind,
} from '../location/connection/character-location-connection'
import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, PrioritizedEntry, VocabularyTerm } from '../types'
import type { CharacterRelationshipSection } from './section'

export const CHARACTER_RELATIONSHIP_KIND_TERM = {
  label: 'Character relationship kind',
  description:
    'Canonical kind of a campaign-scoped character relationship edge — organization, location, or person.',
  sentence: {
    singular: 'character relationship kind',
    plural: 'character relationship kinds',
  },
} as const satisfies VocabularyTerm

export type CharacterRelationshipEdgeKindEntry = GameTermEntry &
  PrioritizedEntry & {
    readonly section: CharacterRelationshipSection
    readonly endpointType: 'organization' | 'location' | 'character'
    readonly symmetric: boolean
    readonly supportsLifecycle: boolean
    /** Subject-owned edge label; falls back to `label`. */
    readonly forwardLabel?: string
    /** Viewer-relative inverse label; falls back to `label`. */
    readonly inverseLabel?: string
  }

const LOCATION_KIND_SECTION: Record<CharacterLocationConnectionKind, CharacterRelationshipSection> =
  {
    owns: 'property',
    tenant: 'property',
    resides_at: 'places',
    operator: 'property',
    works_at: 'property',
  }

const LOCATION_KIND_SUPPORTS_LIFECYCLE: Record<CharacterLocationConnectionKind, boolean> = {
  owns: true,
  tenant: true,
  resides_at: true,
  operator: true,
  works_at: true,
}

function locationKindEntry(
  kind: CharacterLocationConnectionKind,
): CharacterRelationshipEdgeKindEntry {
  const source = CHARACTER_LOCATION_CONNECTION_ENTRIES[kind]
  return {
    label: source.label,
    description: source.description,
    forwardLabel: 'forwardLabel' in source ? source.forwardLabel : undefined,
    inverseLabel: 'inverseLabel' in source ? source.inverseLabel : undefined,
    priority: source.priority,
    section: LOCATION_KIND_SECTION[kind],
    endpointType: 'location',
    symmetric: false,
    supportsLifecycle: LOCATION_KIND_SUPPORTS_LIFECYCLE[kind],
  }
}

export const CHARACTER_RELATIONSHIP_EDGE_KIND_ENTRIES = {
  organizationMembership: {
    label: 'Member',
    forwardLabel: 'Member of',
    inverseLabel: 'Member',
    description: 'Membership in a campaign organization.',
    priority: 100,
    section: 'organizations',
    endpointType: 'organization',
    symmetric: false,
    supportsLifecycle: true,
  },
  owns: locationKindEntry('owns'),
  tenant: locationKindEntry('tenant'),
  resides_at: locationKindEntry('resides_at'),
  operator: locationKindEntry('operator'),
  works_at: locationKindEntry('works_at'),
  hometown: {
    label: 'Hometown',
    forwardLabel: 'Hometown',
    inverseLabel: 'Hometown of',
    description: 'Subjective origin association with a place — distinct from birthplace.',
    priority: 25,
    section: 'places',
    endpointType: 'location',
    symmetric: false,
    supportsLifecycle: false,
  },
  birthplace: {
    label: 'Birthplace',
    forwardLabel: 'Born in',
    inverseLabel: 'Birthplace of',
    description: 'Historical birthplace association with a place.',
    priority: 20,
    section: 'places',
    endpointType: 'location',
    symmetric: false,
    supportsLifecycle: false,
  },
  parentOf: {
    label: 'Parent',
    forwardLabel: 'Parent of',
    inverseLabel: 'Child',
    description: 'Directed parent-to-child family relationship.',
    priority: 90,
    section: 'people.family',
    endpointType: 'character',
    symmetric: false,
    supportsLifecycle: false,
  },
  partnerOf: {
    label: 'Partner',
    description: 'Symmetric partnership or marriage between two characters.',
    priority: 80,
    section: 'people.family',
    endpointType: 'character',
    symmetric: true,
    supportsLifecycle: true,
  },
  siblingOf: {
    label: 'Sibling',
    description: 'Symmetric sibling relationship — explicitly authored, not inferred.',
    priority: 70,
    section: 'people.family',
    endpointType: 'character',
    symmetric: true,
    supportsLifecycle: false,
  },
  mentorOf: {
    label: 'Mentor',
    forwardLabel: 'Mentor of',
    inverseLabel: 'Student',
    description: 'Directed mentor-to-student relationship.',
    priority: 60,
    section: 'people.social',
    endpointType: 'character',
    symmetric: false,
    supportsLifecycle: true,
  },
  rivalOf: {
    label: 'Rival',
    forwardLabel: 'Rival of',
    inverseLabel: 'Considers you a rival',
    description: 'Directed rivalry — one character perceives another as a rival.',
    priority: 50,
    section: 'people.social',
    endpointType: 'character',
    symmetric: false,
    supportsLifecycle: true,
  },
  friendOf: {
    label: 'Friend',
    description: 'Symmetric friendship between two characters.',
    priority: 45,
    section: 'people.social',
    endpointType: 'character',
    symmetric: true,
    supportsLifecycle: true,
  },
  allyOf: {
    label: 'Ally',
    description: 'Symmetric alliance between two characters.',
    priority: 40,
    section: 'people.social',
    endpointType: 'character',
    symmetric: true,
    supportsLifecycle: true,
  },
  enemyOf: {
    label: 'Enemy',
    forwardLabel: 'Enemy of',
    inverseLabel: 'Considers you an enemy',
    description: 'Directed enmity — one character perceives another as an enemy.',
    priority: 35,
    section: 'people.social',
    endpointType: 'character',
    symmetric: false,
    supportsLifecycle: true,
  },
} as const satisfies Record<string, CharacterRelationshipEdgeKindEntry>

export type CharacterRelationshipEdgeKind = keyof typeof CHARACTER_RELATIONSHIP_EDGE_KIND_ENTRIES

export const CHARACTER_RELATIONSHIP_EDGE_KIND_IDS = keysFromEntries(
  CHARACTER_RELATIONSHIP_EDGE_KIND_ENTRIES,
)

export const characterRelationshipEdgeKindSchema = vocabEnumFromEntries(
  CHARACTER_RELATIONSHIP_EDGE_KIND_ENTRIES,
)

export function getCharacterRelationshipEdgeKindEntry(
  id: string,
): CharacterRelationshipEdgeKindEntry | undefined {
  return CHARACTER_RELATIONSHIP_EDGE_KIND_ENTRIES[id as CharacterRelationshipEdgeKind]
}

export function getCharacterRelationshipEdgeKindLabel(id: string): string {
  return getCharacterRelationshipEdgeKindEntry(id)?.label ?? id
}

export function getCharacterRelationshipEdgeKindDisplayLabel(
  id: string,
  direction: 'forward' | 'inverse',
): string {
  const entry = getCharacterRelationshipEdgeKindEntry(id)
  if (!entry) return id
  if (direction === 'forward') {
    return entry.forwardLabel ?? entry.label
  }
  return entry.inverseLabel ?? entry.label
}

export function isSymmetricCharacterRelationshipEdgeKind(
  kind: CharacterRelationshipEdgeKind,
): boolean {
  return CHARACTER_RELATIONSHIP_EDGE_KIND_ENTRIES[kind].symmetric
}

export function characterRelationshipEdgeKindSupportsLifecycle(
  kind: CharacterRelationshipEdgeKind,
): boolean {
  return CHARACTER_RELATIONSHIP_EDGE_KIND_ENTRIES[kind].supportsLifecycle
}

export function getCharacterRelationshipEdgeKindSection(
  kind: CharacterRelationshipEdgeKind,
): CharacterRelationshipSection {
  return CHARACTER_RELATIONSHIP_EDGE_KIND_ENTRIES[kind].section
}
