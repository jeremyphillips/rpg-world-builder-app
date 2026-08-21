'use client'

import { useMemo, useState } from 'react'

import {
  getOrganizationDomainLabel,
  resolvePlayableBuilderContent,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterOrganizationConnection,
} from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Button, InsetPanel, Text } from '@rpg/ui'

import { ContentEntityCard } from '@/features/content'
import { BuilderInventoryRemoveAction } from '../../inventory/builder-inventory-remove-action.client'
import { OrganizationPickerDrawer } from '../../../connections/organization-picker-drawer.client'
import type { OrganizationMembershipSelection } from '../../../connections/organization-picker-drawer.types'
import {
  connectionsStepEmptyClasses,
  connectionsStepHeaderClasses,
  connectionsStepListClasses,
} from '../../../connections/organization-picker-drawer.variants'
import { BuilderStepFrame } from '../shared/builder-step-frame.client'

export type ConnectionsStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

function membershipSecondaryLabel(
  membership: CharacterOrganizationConnection,
  organizationDomain: string | undefined,
): string | null {
  if (membership.title) return membership.title
  if (organizationDomain) return getOrganizationDomainLabel(organizationDomain)
  return null
}

export function ConnectionsStep({
  context,
  draft,
  validationIssues,
  onDraftChange,
}: ConnectionsStepProps) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const availableOrganizations = useMemo(
    () => resolvePlayableBuilderContent(context).organizations,
    [context],
  )
  const memberships = draft.connections.organizations
  const selectedIdSet = new Set(memberships.map(({ organizationId }) => organizationId))
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

  // Title and priority arrive already stamped by the picker's shared metadata helper —
  // the builder must not derive priority locally.
  const handleAdd = (membership: OrganizationMembershipSelection) => {
    if (selectedIdSet.has(membership.organizationId)) return
    onDraftChange({
      connections: {
        organizations: [...memberships, membership],
        locations: draft.connections.locations,
      },
    })
  }

  const handleRemove = (organizationId: string) => {
    onDraftChange({
      connections: {
        organizations: memberships.filter(
          (membership) => membership.organizationId !== organizationId,
        ),
        locations: draft.connections.locations,
      },
    })
  }

  return (
    <BuilderStepFrame stepId="connections" validationIssues={validationIssues}>
      <div className={connectionsStepHeaderClasses}>
        <Text variant="muted">
          Add organizations that shape this character’s loyalties, obligations, or history.
        </Text>
        <Button type="button" onClick={() => setPickerOpen(true)}>
          {memberships.length === 0 ? 'Add organization' : '+ Add organization'}
        </Button>
      </div>

      {memberships.length === 0 ? (
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
          {memberships.map((membership) => {
            const organization = organizationsById.get(membership.organizationId)
            const unavailable = !availableIdSet.has(membership.organizationId)
            const label = organization?.name ?? membership.organizationId
            const secondary = membershipSecondaryLabel(membership, organization?.organizationDomain)

            const status = [
              ...(secondary
                ? [{ kind: 'text' as const, label: secondary, variant: 'muted' as const }]
                : []),
              ...(unavailable
                ? [
                    {
                      kind: 'badge' as const,
                      label: organization ? 'Unavailable' : 'Missing organization',
                      tone: 'warning' as const,
                    },
                  ]
                : []),
            ]

            return (
              <ContentEntityCard
                key={membership.organizationId}
                entity={{
                  heading: label,
                  status: status.length > 0 ? status : undefined,
                }}
                trailing={{
                  kind: 'action',
                  content: (
                    <BuilderInventoryRemoveAction
                      itemLabel={label}
                      onRemove={() => handleRemove(membership.organizationId)}
                    />
                  ),
                }}
                density="compact"
              />
            )
          })}
        </div>
      )}

      <OrganizationPickerDrawer
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        items={pickerItems}
        onAdd={handleAdd}
      />
    </BuilderStepFrame>
  )
}
