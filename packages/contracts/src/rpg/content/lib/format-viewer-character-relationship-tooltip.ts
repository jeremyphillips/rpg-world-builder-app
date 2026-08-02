import { joinNaturalList } from '../../primitives/prose'

import { CLASS_CONTENT_TYPE_TERM, SPECIES_CONTENT_TYPE_TERM } from './content-type-terms'
import {
  CHARACTER_RELATIONSHIP_KIND_ORDER,
  type CharacterRelationshipKind,
  type ViewerCharacterRelationshipGroup,
  type ViewerCharacterRelationships,
} from './viewer-character-relationship'

const PREFIX_GROUP_LABELS: Record<Exclude<CharacterRelationshipKind, 'has' | 'member'>, string> = {
  class: `${CLASS_CONTENT_TYPE_TERM.label} of`,
  subclass: 'Subclass of',
  species: `${SPECIES_CONTENT_TYPE_TERM.label} of`,
  owns: 'Owned by',
  knows: 'Known by',
  prepared: 'Prepared by',
}

function sortGroups(
  groups: readonly ViewerCharacterRelationshipGroup[],
): ViewerCharacterRelationshipGroup[] {
  return [...groups].sort(
    (left, right) =>
      CHARACTER_RELATIONSHIP_KIND_ORDER[left.kind] - CHARACTER_RELATIONSHIP_KIND_ORDER[right.kind],
  )
}

function formatNameList(group: ViewerCharacterRelationshipGroup): {
  visibleNames: string[]
  hiddenCount: number
} {
  const visibleNames = group.relationships.map((relationship) => relationship.characterName)
  return {
    visibleNames,
    hiddenCount: Math.max(0, group.count - visibleNames.length),
  }
}

function formatNamesWithOverflow(group: ViewerCharacterRelationshipGroup): string {
  const { visibleNames, hiddenCount } = formatNameList(group)

  if (hiddenCount === 0) {
    return joinNaturalList(visibleNames)
  }

  if (visibleNames.length === 0) {
    return `${hiddenCount} more`
  }

  if (visibleNames.length === 1) {
    return `${visibleNames[0]} and ${hiddenCount} more`
  }

  return `${visibleNames.join(', ')}, and ${hiddenCount} more`
}

function resolveHasNoun(envelope: ViewerCharacterRelationships): string {
  const hasNoun = envelope.presentation?.hasNoun
  if (!hasNoun) {
    throw new Error('Missing presentation.hasNoun for character relationship kind "has".')
  }
  return hasNoun
}

function formatHasGroupClause(
  group: ViewerCharacterRelationshipGroup,
  envelope: ViewerCharacterRelationships,
): string {
  const hasNoun = resolveHasNoun(envelope)
  if (group.count === 1) {
    return `${group.relationships[0]!.characterName} has this ${hasNoun}`
  }
  if (group.count === 2 && group.relationships.length >= 2) {
    return `${group.relationships[0]!.characterName} and ${group.relationships[1]!.characterName} have this ${hasNoun}`
  }
  return `${formatNamesWithOverflow(group)} have this ${hasNoun}`
}

function formatMemberGroupClause(group: ViewerCharacterRelationshipGroup): string {
  if (group.count === 1) {
    return `${group.relationships[0]!.characterName} is a member`
  }
  return `${formatNamesWithOverflow(group)} are members`
}

function formatGroupClause(
  group: ViewerCharacterRelationshipGroup,
  envelope: ViewerCharacterRelationships,
): string {
  if (group.kind === 'has') {
    return formatHasGroupClause(group, envelope)
  }

  if (group.kind === 'member') {
    return formatMemberGroupClause(group)
  }

  return `${PREFIX_GROUP_LABELS[group.kind]} ${formatNamesWithOverflow(group)}`
}

/** Tooltip copy for the viewer-character relationship name indicator. */
export function formatViewerCharacterRelationshipTooltip(
  envelope: ViewerCharacterRelationships,
): string {
  return sortGroups(envelope.groups)
    .map((group) => formatGroupClause(group, envelope))
    .join(' · ')
}
