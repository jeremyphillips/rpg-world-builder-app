import type { CharacterRelationshipDraftEdges } from '@rpg/contracts'

import {
  areRelationshipDraftEdgesEqual,
  relationshipEdgesFromMembershipAndResidenceRows,
  relationshipEdgesToOrganizationMembershipRows,
  relationshipEdgesToResidenceRows,
} from '../relationship/character-relationship-form-rows.lib'
import type { ConnectionsFormValues } from './connections-form-fields'

export function connectionsDraftToFormValues(
  relationshipEdges: CharacterRelationshipDraftEdges,
): ConnectionsFormValues {
  return {
    organizations: relationshipEdgesToOrganizationMembershipRows(relationshipEdges),
    locations: relationshipEdgesToResidenceRows(relationshipEdges),
  }
}

export function connectionsFormValuesToDraft(
  values: ConnectionsFormValues,
  priorEdges: CharacterRelationshipDraftEdges,
): CharacterRelationshipDraftEdges {
  return relationshipEdgesFromMembershipAndResidenceRows({
    organizations: values.organizations,
    locations: values.locations,
    priorEdges,
  })
}

export function areConnectionsDraftsEqual(
  left: CharacterRelationshipDraftEdges,
  right: CharacterRelationshipDraftEdges,
): boolean {
  return areRelationshipDraftEdgesEqual(left, right)
}
