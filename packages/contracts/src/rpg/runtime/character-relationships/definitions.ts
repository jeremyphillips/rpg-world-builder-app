import {
  CHARACTER_RELATIONSHIP_EDGE_KIND_ENTRIES,
  type CharacterRelationshipEdgeKind,
  type CharacterRelationshipEdgeKindEntry,
} from '../../vocab/character-relationship/kind'
import type { CharacterRelationshipSection } from '../../vocab/character-relationship/section'

export type CharacterRelationshipEditCapabilities = {
  canUpdateDetails: boolean
  canDelete: boolean
}

export type CharacterRelationshipEdgeKindDefinition = CharacterRelationshipEdgeKindEntry & {
  readonly kind: CharacterRelationshipEdgeKind
  readonly multiplicity: 'many'
  readonly editCapabilities: CharacterRelationshipEditCapabilities
}

const DEFAULT_EDIT_CAPABILITIES: CharacterRelationshipEditCapabilities = {
  canUpdateDetails: true,
  canDelete: true,
}

export const CHARACTER_RELATIONSHIP_EDGE_KIND_DEFINITIONS = Object.fromEntries(
  Object.entries(CHARACTER_RELATIONSHIP_EDGE_KIND_ENTRIES).map(([kind, entry]) => [
    kind,
    {
      kind: kind as CharacterRelationshipEdgeKind,
      ...entry,
      multiplicity: 'many' as const,
      editCapabilities: DEFAULT_EDIT_CAPABILITIES,
    },
  ]),
) as Record<CharacterRelationshipEdgeKind, CharacterRelationshipEdgeKindDefinition>

export function getCharacterRelationshipEdgeKindDefinition(
  kind: CharacterRelationshipEdgeKind,
): CharacterRelationshipEdgeKindDefinition {
  return CHARACTER_RELATIONSHIP_EDGE_KIND_DEFINITIONS[kind]
}

export function listCharacterRelationshipEdgeKindsBySection(
  section: CharacterRelationshipSection,
): readonly CharacterRelationshipEdgeKind[] {
  return Object.values(CHARACTER_RELATIONSHIP_EDGE_KIND_DEFINITIONS)
    .filter((definition) => definition.section === section)
    .map((definition) => definition.kind)
}
