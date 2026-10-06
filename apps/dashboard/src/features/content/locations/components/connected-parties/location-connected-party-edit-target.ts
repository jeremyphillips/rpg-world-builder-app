import type {
  CharacterLocationConnectionKind,
  LocationConnectedPartyRow,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'

export type LocationConnectedPartyEditTarget =
  | {
      relationshipId: string
      subjectType: 'organization'
      subjectId: string
      kind: OrganizationLocationConnectionKind
    }
  | {
      relationshipId: string
      subjectType: 'character'
      subjectId: string
      kind: CharacterLocationConnectionKind
    }

/** Builds the typed edit target for a connected-party row, preserving the subject branch. */
export function toLocationConnectedPartyEditTarget(
  row: LocationConnectedPartyRow,
): LocationConnectedPartyEditTarget {
  return row.subjectType === 'organization'
    ? {
        relationshipId: row.relationshipId,
        subjectType: 'organization',
        subjectId: row.subject.id,
        kind: row.kind,
      }
    : {
        relationshipId: row.relationshipId,
        subjectType: 'character',
        subjectId: row.subject.id,
        kind: row.kind,
      }
}
