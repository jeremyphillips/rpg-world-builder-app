import type {
  CharacterRelationshipDraftEdge,
  CharacterRelationshipDraftEdges,
} from '@rpg/contracts'

import { OrganizationPickerDrawer } from '../../../connections/picker/organization-picker-drawer'
import { PersonRelationshipAddDrawer } from '../../../connections/picker/person-relationship-add-drawer'
import { LocationRelationshipAddDrawer } from '../../../connections/picker/location-relationship-add-drawer'
import { EditOrganizationMembershipDrawer } from '../../../connections/edit-organization-membership-drawer'
import {
  PLACE_CONNECTION_ROLE_OPTIONS,
  PROPERTY_CONNECTION_ROLE_OPTIONS,
  type PlaceConnectionRoleOption,
  type PropertyConnectionRoleOption,
} from '../../../../lib/relationship/connection-role-catalog'
import {
  createOrganizationMembershipDraftEdge,
  createPersonDraftEdge,
  createPlaceDraftEdge,
  createPropertyDraftEdge,
  removeDraftEdgeById,
  updateDraftEdgeDetails,
  upsertDraftEdge,
} from '../../../../lib/relationship/connection-draft-edges.lib'
import type {
  ConnectionsStepActiveDrawer,
  ConnectionsStepData,
} from '../../../../lib/relationship/connections-step-panels.lib'

export type ConnectionsStepDrawersProps = {
  activeDrawer: ConnectionsStepActiveDrawer
  onActiveDrawerChange: (drawer: ConnectionsStepActiveDrawer) => void
  editingMembershipEdgeId: string | null
  onEditingMembershipEdgeIdChange: (edgeId: string | null) => void
  relationshipEdges: CharacterRelationshipDraftEdges
  stepData: ConnectionsStepData
  onUpdateEdges: (nextEdges: CharacterRelationshipDraftEdges) => void
}

// Orchestrator: wires section-specific add/edit drawers to draft-edge mutations.
// fallow-ignore-next-line complexity
export function ConnectionsStepDrawers({
  activeDrawer,
  onActiveDrawerChange,
  editingMembershipEdgeId,
  onEditingMembershipEdgeIdChange,
  relationshipEdges,
  stepData,
  onUpdateEdges,
}: ConnectionsStepDrawersProps) {
  const editingMembershipEdge = relationshipEdges.find(
    (edge): edge is Extract<CharacterRelationshipDraftEdge, { kind: 'organizationMembership' }> =>
      edge.id === editingMembershipEdgeId && edge.kind === 'organizationMembership',
  )
  const editingOrganization =
    editingMembershipEdge && stepData.organizationsById.get(editingMembershipEdge.organizationId)

  const closeDrawer = () => onActiveDrawerChange(null)

  return (
    <>
      <PersonRelationshipAddDrawer
        open={activeDrawer?.section === 'people'}
        onOpenChange={(open) => {
          if (!open) closeDrawer()
        }}
        characters={stepData.campaignCharacterOptions}
        presetRole={activeDrawer?.section === 'people' ? activeDrawer.presetRole : undefined}
        onAdd={({ characterId, role }) => {
          const edge = createPersonDraftEdge(role, characterId)
          onUpdateEdges(upsertDraftEdge(relationshipEdges, edge))
        }}
      />

      <OrganizationPickerDrawer
        open={activeDrawer?.section === 'organizations'}
        onOpenChange={(open) => {
          if (!open) closeDrawer()
        }}
        items={stepData.availableOrganizations.map((organization) => ({
          organization,
          selected: relationshipEdges.some(
            (edge) =>
              edge.kind === 'organizationMembership' && edge.organizationId === organization.id,
          ),
        }))}
        onAdd={(selection) => {
          const edge = createOrganizationMembershipDraftEdge(selection.organizationId, {
            title: selection.title,
            priority: selection.priority,
          })
          onUpdateEdges(upsertDraftEdge(relationshipEdges, edge))
        }}
      />

      <LocationRelationshipAddDrawer
        open={activeDrawer?.section === 'places'}
        onOpenChange={(open) => {
          if (!open) closeDrawer()
        }}
        title={
          activeDrawer?.section === 'places' && activeDrawer.presetRole
            ? activeDrawer.presetRole.shortcutLabel
            : 'Add place'
        }
        locations={
          activeDrawer?.section === 'places' && activeDrawer.presetRole?.kind === 'resides_at'
            ? stepData.eligibleResidenceLocations
            : stepData.allLocations
        }
        roleOptions={PLACE_CONNECTION_ROLE_OPTIONS}
        presetRole={activeDrawer?.section === 'places' ? activeDrawer.presetRole : undefined}
        onAdd={({ locationId, role }) => {
          const edge = createPlaceDraftEdge(role as PlaceConnectionRoleOption, locationId)
          onUpdateEdges(upsertDraftEdge(relationshipEdges, edge))
        }}
      />

      <LocationRelationshipAddDrawer
        open={activeDrawer?.section === 'property'}
        onOpenChange={(open) => {
          if (!open) closeDrawer()
        }}
        title={
          activeDrawer?.section === 'property' && activeDrawer.presetRole
            ? activeDrawer.presetRole.shortcutLabel
            : 'Add property'
        }
        locations={stepData.eligiblePropertyLocations}
        roleOptions={PROPERTY_CONNECTION_ROLE_OPTIONS}
        presetRole={activeDrawer?.section === 'property' ? activeDrawer.presetRole : undefined}
        onAdd={({ locationId, role }) => {
          const edge = createPropertyDraftEdge(role as PropertyConnectionRoleOption, locationId)
          onUpdateEdges(upsertDraftEdge(relationshipEdges, edge))
        }}
      />

      {editingMembershipEdge && editingOrganization ? (
        <EditOrganizationMembershipDrawer
          open={Boolean(editingMembershipEdgeId)}
          onOpenChange={(open) => {
            if (!open) onEditingMembershipEdgeIdChange(null)
          }}
          organization={editingOrganization}
          characterName="this character"
          currentTitle={editingMembershipEdge.details?.title}
          onSave={async (title) => {
            const nextEdge = updateDraftEdgeDetails(editingMembershipEdge, {
              ...(title !== undefined ? { title } : {}),
              lifecycle: 'current',
            })
            onUpdateEdges(upsertDraftEdge(relationshipEdges, nextEdge))
          }}
          onRemove={async () => {
            onUpdateEdges(removeDraftEdgeById(relationshipEdges, editingMembershipEdge.id))
          }}
        />
      ) : null}
    </>
  )
}
