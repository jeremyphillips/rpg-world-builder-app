import {
  characterRelationshipEdgeKindSupportsLifecycle,
  type CharacterRelationshipProjectionRow,
} from '@rpg/contracts'

import {
  membershipRadioValueFromTitle,
  titleFromMembershipRadioValue,
} from '../organization-membership/organization-membership-title.lib'

export type ConnectionDetailsFormState = {
  membershipTitle: string
  lifecycle: 'current' | 'former'
  isPrimary: boolean
}

export const EMPTY_CONNECTION_DETAILS_FORM_STATE: ConnectionDetailsFormState = {
  membershipTitle: '',
  lifecycle: 'current',
  isPrimary: false,
}

export function connectionDetailsFromProjection(
  row: CharacterRelationshipProjectionRow | null,
): ConnectionDetailsFormState {
  if (!row) return EMPTY_CONNECTION_DETAILS_FORM_STATE

  return {
    membershipTitle: membershipRadioValueFromTitle((row.details as { title?: string }).title),
    lifecycle: (row.details as { lifecycle?: 'current' | 'former' }).lifecycle ?? 'current',
    isPrimary: Boolean((row.details as { isPrimary?: boolean }).isPrimary),
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
