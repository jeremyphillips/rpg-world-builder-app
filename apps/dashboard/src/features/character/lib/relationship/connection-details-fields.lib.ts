import {
  characterRelationshipEdgeKindSupportsLifecycle,
  type CharacterRelationshipDraftEdge,
  type CharacterRelationshipProjectionRow,
  type CharacterRelationshipVisibility,
} from '@rpg/contracts'

import {
  membershipRadioValueFromTitle,
  titleFromMembershipRadioValue,
} from '../organization-membership/organization-membership-title.lib'

export type ConnectionDetailsFormState = {
  membershipTitle: string
  lifecycle: 'current' | 'former'
  isPrimary: boolean
  visibility: CharacterRelationshipVisibility
  participantIds: string[]
}

export const EMPTY_CONNECTION_DETAILS_FORM_STATE: ConnectionDetailsFormState = {
  membershipTitle: '',
  lifecycle: 'current',
  isPrimary: false,
  visibility: 'dm_only',
  participantIds: [],
}

export function connectionDetailsFromDraftEdge(
  edge: CharacterRelationshipDraftEdge,
): ConnectionDetailsFormState {
  return {
    membershipTitle: membershipRadioValueFromTitle(
      (edge.details as { title?: string } | undefined)?.title,
    ),
    lifecycle:
      (edge.details as { lifecycle?: 'current' | 'former' } | undefined)?.lifecycle ?? 'current',
    isPrimary: Boolean((edge.details as { isPrimary?: boolean } | undefined)?.isPrimary),
    visibility: 'dm_only',
    participantIds: [],
  }
}

export function connectionDetailsFromProjection(
  row: CharacterRelationshipProjectionRow | null,
): ConnectionDetailsFormState {
  if (!row) return EMPTY_CONNECTION_DETAILS_FORM_STATE

  return {
    membershipTitle: membershipRadioValueFromTitle((row.details as { title?: string }).title),
    lifecycle: (row.details as { lifecycle?: 'current' | 'former' }).lifecycle ?? 'current',
    isPrimary: Boolean((row.details as { isPrimary?: boolean }).isPrimary),
    visibility: row.visibility,
    participantIds: row.participantIds,
  }
}

export function buildConnectionDetailsPatch(
  rowKind: CharacterRelationshipProjectionRow['kind'],
  state: ConnectionDetailsFormState,
): Record<string, unknown> {
  if (rowKind === 'organizationMembership') {
    const title = titleFromMembershipRadioValue(state.membershipTitle)
    return {
      title: title ?? null,
    }
  }

  if (rowKind === 'resides_at') {
    return {
      lifecycle: state.lifecycle,
      isPrimary: state.isPrimary,
    }
  }

  if (characterRelationshipEdgeKindSupportsLifecycle(rowKind)) {
    return {
      lifecycle: state.lifecycle,
    }
  }

  return {}
}

export function buildConnectionAudiencePatch(state: ConnectionDetailsFormState): {
  visibility: CharacterRelationshipVisibility
  participantIds: string[]
} {
  return {
    visibility: state.visibility,
    participantIds: state.visibility === 'specific_players' ? state.participantIds : [],
  }
}
