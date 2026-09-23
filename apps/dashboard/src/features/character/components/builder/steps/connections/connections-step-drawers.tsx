import * as React from 'react'

import type {
  CharacterRelationshipDraftEdge,
  CharacterRelationshipDraftEdges,
} from '@rpg/contracts'
import { Button, Modal } from '@rpg/ui'

import { OrganizationPickerDrawer } from '../../../connections/picker/organization-picker-drawer'
import { PersonRelationshipAddDrawer } from '../../../connections/picker/person-relationship-add-drawer'
import { LocationRelationshipAddDrawer } from '../../../connections/picker/location-relationship-add-drawer'
import { EditOrganizationMembershipDrawer } from '../../../connections/edit-organization-membership-drawer'
import { ConnectionDetailsFields } from '../../../detail/connections/character-connection-details-fields'
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
  draftEdgeHasEditableDetails,
  removeDraftEdgeById,
  updateDraftEdgeDetails,
  upsertDraftEdge,
} from '../../../../lib/relationship/connection-draft-edges.lib'
import {
  buildConnectionDetailsPatch,
  connectionDetailsFromDraftEdge,
  type ConnectionDetailsFormState,
} from '../../../../lib/relationship/connection-details-fields.lib'
import type {
  ConnectionsStepActiveDrawer,
  ConnectionsStepData,
} from '../../../../lib/relationship/connections-step-panels.lib'

export type ConnectionsStepDrawersProps = {
  activeDrawer: ConnectionsStepActiveDrawer
  onActiveDrawerChange: (drawer: ConnectionsStepActiveDrawer) => void
  editingEdgeId: string | null
  onEditingEdgeIdChange: (edgeId: string | null) => void
  relationshipEdges: CharacterRelationshipDraftEdges
  stepData: ConnectionsStepData
  onUpdateEdges: (nextEdges: CharacterRelationshipDraftEdges) => void
}

function toConnectionDetailsSheetData(stepData: ConnectionsStepData) {
  return {
    campaignId: stepData.campaignId ?? '',
    characterId: '',
    availableOrganizations: stepData.availableOrganizations,
    organizationsById: stepData.organizationsById,
    locationsById: stepData.locationsById,
    charactersById: stepData.charactersById,
    campaignCharacterOptions: stepData.campaignCharacterOptions,
    eligibleResidenceLocations: stepData.eligibleResidenceLocations,
    eligiblePropertyLocations: stepData.eligiblePropertyLocations,
    allLocations: stepData.allLocations,
    locationsQueryStatus: stepData.locationsQueryStatus,
  }
}

function ConnectionDraftDetailsDrawer(input: {
  edge: CharacterRelationshipDraftEdge
  stepData: ConnectionsStepData
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (patch: Record<string, unknown>) => void
}) {
  const [state, setState] = React.useState<ConnectionDetailsFormState>(() =>
    connectionDetailsFromDraftEdge(input.edge),
  )

  React.useEffect(() => {
    setState(connectionDetailsFromDraftEdge(input.edge))
  }, [input.edge])

  return (
    <Modal.Root open={input.open} onOpenChange={input.onOpenChange}>
      <Modal.Content size="md" aria-describedby="connection-draft-details-description">
        <Modal.Header headline="Edit connection details" />
        <Modal.Body id="connection-draft-details-description">
          <ConnectionDetailsFields
            rowKind={input.edge.kind}
            organizationId={
              input.edge.kind === 'organizationMembership' ? input.edge.organizationId : undefined
            }
            sheetData={toConnectionDetailsSheetData(input.stepData)}
            state={state}
            onStateChange={setState}
          />
        </Modal.Body>
        <Modal.Footer>
          <Modal.FooterActions>
            <Button type="button" variant="outline" onClick={() => input.onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                input.onSave(buildConnectionDetailsPatch(input.edge.kind, state))
                input.onOpenChange(false)
              }}
            >
              Save
            </Button>
          </Modal.FooterActions>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}

// Orchestrator: wires section-specific add/edit drawers to draft-edge mutations.
// fallow-ignore-next-line complexity
export function ConnectionsStepDrawers({
  activeDrawer,
  onActiveDrawerChange,
  editingEdgeId,
  onEditingEdgeIdChange,
  relationshipEdges,
  stepData,
  onUpdateEdges,
}: ConnectionsStepDrawersProps) {
  const editingEdge = relationshipEdges.find((edge) => edge.id === editingEdgeId) ?? null
  const editingMembershipEdge = editingEdge?.kind === 'organizationMembership' ? editingEdge : null
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
          open={Boolean(editingEdgeId)}
          onOpenChange={(open) => {
            if (!open) onEditingEdgeIdChange(null)
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

      {editingEdge &&
      editingEdge.kind !== 'organizationMembership' &&
      draftEdgeHasEditableDetails(editingEdge.kind) ? (
        <ConnectionDraftDetailsDrawer
          edge={editingEdge}
          stepData={stepData}
          open={Boolean(editingEdgeId)}
          onOpenChange={(open) => {
            if (!open) onEditingEdgeIdChange(null)
          }}
          onSave={(patch) => {
            onUpdateEdges(
              upsertDraftEdge(relationshipEdges, updateDraftEdgeDetails(editingEdge, patch)),
            )
          }}
        />
      ) : null}
    </>
  )
}
