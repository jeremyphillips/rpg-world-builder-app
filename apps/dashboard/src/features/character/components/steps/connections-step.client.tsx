'use client'

import { useMemo, useState } from 'react'

import {
  getOrganizationKindLabel,
  resolveAvailableContent,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Badge, Button, InsetPanel, Text } from '@rpg/ui'

import { BuilderInventoryRow } from '../builder/builder-inventory-row.client'
import { OrganizationPickerDrawer } from '../connections/organization-picker-drawer.client'
import {
  connectionsStepEmptyClasses,
  connectionsStepHeaderClasses,
  connectionsStepListClasses,
} from '../connections/organization-picker-drawer.variants'
import { BuilderStepFrame } from './builder-step-frame.client'

export type ConnectionsStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function ConnectionsStep({
  context,
  draft,
  validationIssues,
  onDraftChange,
}: ConnectionsStepProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const availableOrganizations = useMemo(
    () => resolveAvailableContent(context).organizations,
    [context],
  )
  const selectedIds = draft.connections.organizations.map(({ organizationId }) => organizationId)
  const selectedIdSet = new Set(selectedIds)
  const organizationsById = useMemo(
    () =>
      new Map(context.catalog.organizations.map((organization) => [organization.id, organization])),
    [context.catalog.organizations],
  )
  const availableIdSet = useMemo(
    () => new Set(availableOrganizations.map(({ id }) => id)),
    [availableOrganizations],
  )
  const pickerItems = availableOrganizations.map((organization) => ({
    organization,
    selected: selectedIdSet.has(organization.id),
  }))

  const updateConnections = (organizationIds: readonly string[]) => {
    onDraftChange({
      connections: {
        organizations: organizationIds.map((organizationId) => ({ organizationId })),
        locations: draft.connections.locations,
      },
    })
  }

  const handleAdd = (organizationId: string) => {
    if (selectedIdSet.has(organizationId)) return
    updateConnections([...selectedIds, organizationId])
  }

  const handleRemove = (organizationId: string) => {
    updateConnections(selectedIds.filter((selectedId) => selectedId !== organizationId))
  }

  return (
    <BuilderStepFrame stepId="connections" validationIssues={validationIssues}>
      <div className={connectionsStepHeaderClasses}>
        <Text variant="muted">
          Add organizations that shape this character’s loyalties, obligations, or history.
        </Text>
        <Button type="button" onClick={() => setPickerOpen(true)}>
          Choose organizations
        </Button>
      </div>

      {selectedIds.length === 0 ? (
        <InsetPanel
          borderStyle="dashed"
          surface={{}}
          size="md"
          align="center"
          className={connectionsStepEmptyClasses}
        >
          <InsetPanel.Text>No organizations selected yet.</InsetPanel.Text>
        </InsetPanel>
      ) : (
        <div className={connectionsStepListClasses} aria-label="Selected organizations">
          {selectedIds.map((organizationId) => {
            const organization = organizationsById.get(organizationId)
            const unavailable = !availableIdSet.has(organizationId)
            const label = organization?.name ?? organizationId

            return (
              <BuilderInventoryRow
                key={organizationId}
                itemLabel={label}
                label={<Text as="span">{label}</Text>}
                meta={
                  <>
                    {organization ? (
                      <Text as="span" variant="muted">
                        {getOrganizationKindLabel(organization.organizationKind)}
                      </Text>
                    ) : null}
                    {unavailable ? (
                      <Badge tone="warning">
                        {organization ? 'Unavailable' : 'Missing organization'}
                      </Badge>
                    ) : null}
                  </>
                }
                onRemove={() => handleRemove(organizationId)}
              />
            )
          })}
        </div>
      )}

      <OrganizationPickerDrawer
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        items={pickerItems}
        selectedCount={selectedIds.length}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
    </BuilderStepFrame>
  )
}
