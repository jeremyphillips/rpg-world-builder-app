'use client'

import * as React from 'react'

import type {
  Location,
  LocationConnectedPartyRow,
  Organization,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  getOrganizationKindLabel,
  getOrganizationLocationConnectionDisplayLabel,
} from '@rpg/contracts'
import { Button, CatalogPickerSheet, Text } from '@rpg/ui'

import { LocationConnectionKindStep } from '../../components/location-connection-kind-step.client'
import {
  CatalogPickerSelectionActions,
  catalogPickerShellProps,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { EntityItem } from '../../lib/content-entity-card.client'
import { buildOrganizationPickerEntitySummary } from '../../lib/content-entity-picker-presentation.lib'
import { EntityReplacementSection } from '../../lib/entity-replacement/entity-replacement-section.client'
import { DrawerContext } from '../../lib/relationship/drawer-context.client'
import { toDrawerContextEntity } from '../../lib/relationship/drawer-context.types'
import type { EntityReplacementCurrentSnapshot } from '../../lib/entity-replacement/entity-replacement-current-entity'
import { ENTITY_REPLACEMENT_UNAVAILABLE_ORGANIZATION_HEADING } from '../../lib/entity-replacement/entity-replacement-current-entity'
import { RELATIONSHIP_DRAWER_ORGANIZATION_FIELD_LABEL } from '../../lib/relationship/relationship-drawer-field-labels'
import { RelationshipDrawerSubjectField } from '../../lib/relationship/relationship-drawer-subject-field.client'

import {
  ORGANIZATION_DRAWER_CHANGE_KIND_SUBMIT_LABEL,
  ORGANIZATION_DRAWER_CHANGE_KIND_TITLE,
  ORGANIZATION_DRAWER_FULLY_LINKED_REASONS,
  ORGANIZATION_DRAWER_KIND_FIELD_LABELS,
  ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS,
  type OrganizationConnectionDrawerIntent,
  organizationInverseSubjectHasAvailableKind,
  resolveOrganizationKindsForDrawerIntent,
} from '../../lib/location-connection-drawer-intent'
import {
  buildOrganizationInverseLocationConnections,
  buildOrganizationLocationConnectionEdgesAtLocation,
} from '../../lib/location-connection-duplicate-keys'
import {
  buildOrganizationLocationChangeKindOptions,
  buildOrganizationInverseLocationConnectionKindOptions,
  resolveActiveConnectionKind,
} from '../../lib/location-connection-kind-options'
import {
  resolveLocationInverseOrganizationAddDrawerInstruction,
  resolveLocationInverseOrganizationAddDrawerTitle,
  resolveLocationInverseOrganizationAddSubmitLabel,
  resolveLocationInverseOrganizationReplaceHelper,
  resolveLocationInverseOrganizationTargetPresentation,
  TERRITORIAL_AUTHORITY_DRAWER,
  LOCATION_INVERSE_ORGANIZATION_DRAWER,
} from '../lib/location-connection-surface-copy'
import { buildLocationContextPresentationFromLocation } from '../lib/location-display'
import { buildOrganizationDrawerContextEntity } from '../../organizations/lib/organization-display'

export const LOCATION_INVERSE_ORG_LINK_CHOOSE_SUBJECT_MESSAGE =
  'Choose an organization to see available connection types.'

import type { OrganizationInverseDrawerMode } from '../../lib/relationship/relationship-mutation-mode'
export type LocationInverseOrganizationConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: OrganizationInverseDrawerMode
  intent: OrganizationConnectionDrawerIntent
  addKind?: OrganizationLocationConnectionKind
  location: Location
  locationsById: ReadonlyMap<string, Location>
  campaignId: string
  organizations: readonly Organization[]
  connectedPartyRows: readonly LocationConnectedPartyRow[]
  initialConnection?: {
    relationshipId: string
    organizationId: string
    kind: OrganizationLocationConnectionKind
  }
  currentEndpoint?: EntityReplacementCurrentSnapshot
  isSubmitting?: boolean
  onSubmit: (input: {
    organizationId: string
    kind: OrganizationLocationConnectionKind
  }) => Promise<void>
}

export function LocationInverseOrganizationConnectionLinkDrawer(
  props: LocationInverseOrganizationConnectionLinkDrawerProps,
) {
  const remountKey = props.open
    ? `${props.mode}:${props.intent}:${props.addKind ?? 'none'}:${props.initialConnection?.relationshipId ?? 'add'}`
    : 'closed'

  return <LocationInverseOrganizationConnectionLinkDrawerContent key={remountKey} {...props} />
}

function hasResolvedAddKind(
  mode: OrganizationInverseDrawerMode,
  addKind?: OrganizationLocationConnectionKind,
): addKind is OrganizationLocationConnectionKind {
  return mode === 'add' && addKind != null
}

// fallow-ignore-next-line complexity
function LocationInverseOrganizationConnectionLinkDrawerContent({
  open,
  onOpenChange,
  mode,
  intent,
  addKind,
  location,
  locationsById,
  campaignId,
  organizations,
  connectedPartyRows,
  initialConnection,
  currentEndpoint,
  isSubmitting = false,
  onSubmit,
}: LocationInverseOrganizationConnectionLinkDrawerProps) {
  const resolvedAddKind = hasResolvedAddKind(mode, addKind) ? addKind : undefined

  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string | null>(
    mode === 'changeKind' ? (initialConnection?.organizationId ?? null) : null,
  )
  const [selectedKind, setSelectedKind] = React.useState<OrganizationLocationConnectionKind | null>(
    resolvedAddKind ??
      (mode === 'changeKind' || mode === 'replaceOrganization'
        ? (initialConnection?.kind ?? null)
        : null),
  )

  const orgRows = React.useMemo(
    () => connectedPartyRows.filter((row) => row.subjectType === 'organization'),
    [connectedPartyRows],
  )

  const excludeRelationshipId =
    mode === 'changeKind' || mode === 'replaceOrganization'
      ? initialConnection?.relationshipId
      : undefined

  const eligibleKinds = React.useMemo(
    () => resolveOrganizationKindsForDrawerIntent(location, intent),
    [intent, location],
  )

  const edgesAtLocation = React.useMemo(
    () => buildOrganizationLocationConnectionEdgesAtLocation(orgRows, location.id),
    [location.id, orgRows],
  )

  const kindOptions = React.useMemo(() => {
    if (mode === 'replaceOrganization' || resolvedAddKind) {
      return []
    }

    const subjectOrganizationId =
      selectedOrganizationId ??
      (mode === 'changeKind' ? initialConnection?.organizationId : undefined)

    if (!subjectOrganizationId) {
      return []
    }

    const connections = buildOrganizationInverseLocationConnections(
      orgRows,
      location.id,
      subjectOrganizationId,
      excludeRelationshipId,
    )

    if (mode === 'changeKind' && initialConnection) {
      return buildOrganizationLocationChangeKindOptions({
        location,
        intent,
        currentKind: initialConnection.kind,
        subjectOrganizationId,
        connections,
        edgesAtLocation,
        excludeConnectionId: excludeRelationshipId,
      })
    }

    return buildOrganizationInverseLocationConnectionKindOptions({
      location,
      kinds: eligibleKinds,
      subjectOrganizationId,
      connections,
      edgesAtLocation,
      excludeConnectionId: excludeRelationshipId,
    })
  }, [
    edgesAtLocation,
    eligibleKinds,
    excludeRelationshipId,
    initialConnection,
    intent,
    location,
    mode,
    orgRows,
    resolvedAddKind,
    selectedOrganizationId,
  ])

  const activeKind = (() => {
    if (resolvedAddKind) return resolvedAddKind
    if (mode === 'replaceOrganization' && initialConnection) return initialConnection.kind
    if (mode === 'changeKind') {
      return selectedKind ?? initialConnection?.kind ?? null
    }

    return resolveActiveConnectionKind(
      selectedKind,
      kindOptions,
    ) as OrganizationLocationConnectionKind | null
  })()

  const showKindStep =
    mode === 'changeKind' || (mode === 'add' && !resolvedAddKind && selectedOrganizationId)

  const lockedOrganization =
    mode === 'changeKind'
      ? organizations.find((organization) => organization.id === initialConnection?.organizationId)
      : undefined

  const hasTargetChange =
    mode === 'replaceOrganization'
      ? selectedOrganizationId != null &&
        selectedOrganizationId !== initialConnection?.organizationId
      : true
  const hasChange =
    (mode !== 'changeKind' || activeKind !== initialConnection?.kind) && hasTargetChange
  const canSubmit = Boolean(
    (mode === 'changeKind'
      ? activeKind && initialConnection?.organizationId
      : selectedOrganizationId && activeKind) &&
    hasChange &&
    !currentEndpoint?.unavailable &&
    !isSubmitting,
  )

  const handleSubmit = async () => {
    const organizationId =
      mode === 'changeKind' ? initialConnection?.organizationId : selectedOrganizationId
    if (!organizationId || !activeKind) return
    await onSubmit({ organizationId, kind: activeKind })
  }

  const title = (() => {
    if (mode === 'changeKind' && intent === 'territorial_authority') {
      return TERRITORIAL_AUTHORITY_DRAWER.changeKindTitle
    }
    if (mode === 'changeKind') {
      return ORGANIZATION_DRAWER_CHANGE_KIND_TITLE
    }
    if (mode === 'replaceOrganization') {
      return intent === 'territorial_authority'
        ? TERRITORIAL_AUTHORITY_DRAWER.replaceTitle
        : LOCATION_INVERSE_ORGANIZATION_DRAWER.replaceTitle
    }
    if (resolvedAddKind) {
      return resolveLocationInverseOrganizationAddDrawerTitle(resolvedAddKind)
    }
    return mode === 'add'
      ? ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS[intent]
      : ORGANIZATION_DRAWER_CHANGE_KIND_TITLE
  })()

  const submitLabel = (() => {
    if (mode === 'changeKind' && intent === 'territorial_authority') {
      return TERRITORIAL_AUTHORITY_DRAWER.changeKindSubmit
    }
    if (mode === 'changeKind') {
      return ORGANIZATION_DRAWER_CHANGE_KIND_SUBMIT_LABEL
    }
    if (mode === 'replaceOrganization') {
      return intent === 'territorial_authority'
        ? TERRITORIAL_AUTHORITY_DRAWER.replaceSubmit
        : LOCATION_INVERSE_ORGANIZATION_DRAWER.replaceSubmit
    }
    if (resolvedAddKind) {
      return resolveLocationInverseOrganizationAddSubmitLabel(resolvedAddKind)
    }
    return mode === 'add'
      ? ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS[intent]
      : ORGANIZATION_DRAWER_CHANGE_KIND_SUBMIT_LABEL
  })()

  const instructionCopy = resolvedAddKind
    ? resolveLocationInverseOrganizationAddDrawerInstruction(resolvedAddKind)
    : null

  const drawerContextEntities = React.useMemo(() => {
    const locationEntity = toDrawerContextEntity(
      buildLocationContextPresentationFromLocation(location, { locationsById, campaignId }),
    )

    if (mode === 'add' || mode === 'replaceOrganization') {
      return [locationEntity]
    }

    if (mode === 'changeKind') {
      const organizationEntity = lockedOrganization
        ? toDrawerContextEntity(buildOrganizationDrawerContextEntity(lockedOrganization))
        : toDrawerContextEntity({ heading: ENTITY_REPLACEMENT_UNAVAILABLE_ORGANIZATION_HEADING })

      return [locationEntity, organizationEntity]
    }

    return []
  }, [campaignId, location, locationsById, lockedOrganization, mode])

  const lockedKindLabel =
    activeKind != null ? getOrganizationLocationConnectionDisplayLabel(activeKind, 'inverse') : null

  const fullyLinkedReason = ORGANIZATION_DRAWER_FULLY_LINKED_REASONS[intent]
  const kindFieldLabel =
    intent === 'territorial_authority'
      ? 'Authority type'
      : ORGANIZATION_DRAWER_KIND_FIELD_LABELS[intent]

  const showOrganizationPicker =
    (mode === 'add' || mode === 'replaceOrganization') && !currentEndpoint?.unavailable

  const replacementOrganizations = React.useMemo(() => {
    if (!showOrganizationPicker) {
      return []
    }

    if (mode !== 'replaceOrganization' || !initialConnection) {
      return organizations
    }

    return organizations.filter(
      (organization) => organization.id !== initialConnection.organizationId,
    )
  }, [initialConnection, mode, organizations, showOrganizationPicker])

  const availabilityKinds = React.useMemo(() => {
    const kinds =
      mode === 'replaceOrganization' && initialConnection
        ? [initialConnection.kind]
        : resolvedAddKind
          ? [resolvedAddKind]
          : eligibleKinds

    return kinds.filter((kind) => eligibleKinds.includes(kind))
  }, [eligibleKinds, initialConnection, mode, resolvedAddKind])

  const organizationTargetPresentation = resolveLocationInverseOrganizationTargetPresentation(
    activeKind ?? initialConnection?.kind ?? resolvedAddKind,
  )

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      {...catalogPickerShellProps()}
      rowLayout="entity-card"
      pickerEnabled={showOrganizationPicker}
      searchPlaceholder={organizationTargetPresentation.searchPlaceholder}
      noResultsMessage={
        intent === 'territorial_authority'
          ? TERRITORIAL_AUTHORITY_DRAWER.organizationNoResults
          : 'No matches for this search.'
      }
      noItemsMessage="No organizations are available."
      headerBelowDescription={
        <div className="space-y-4">
          <DrawerContext entities={drawerContextEntities} />
          {mode === 'replaceOrganization' && lockedKindLabel ? (
            <RelationshipDrawerSubjectField label={kindFieldLabel} value={lockedKindLabel} />
          ) : null}
          {mode === 'replaceOrganization' ? (
            <EntityReplacementSection
              entityLabel={RELATIONSHIP_DRAWER_ORGANIZATION_FIELD_LABEL}
              current={currentEndpoint}
              newHelper={resolveLocationInverseOrganizationReplaceHelper(
                initialConnection?.kind ?? activeKind ?? 'operates_in',
              )}
            />
          ) : null}
          {instructionCopy ? (
            <Text variant="muted" className="text-sm">
              {instructionCopy}
            </Text>
          ) : null}
          {showKindStep ? (
            <LocationConnectionKindStep
              id="location-inverse-organization-connection-kind"
              label={kindFieldLabel}
              options={kindOptions}
              value={activeKind}
              onValueChange={(value) =>
                setSelectedKind(value as OrganizationLocationConnectionKind)
              }
              defaultExpanded={mode === 'changeKind'}
            />
          ) : null}
        </div>
      }
      emptyState={
        mode === 'add' && !resolvedAddKind && !selectedOrganizationId ? (
          <Text variant="muted" className="text-sm" role="status">
            {LOCATION_INVERSE_ORG_LINK_CHOOSE_SUBJECT_MESSAGE}
          </Text>
        ) : undefined
      }
      footer={
        (mode === 'changeKind' || showOrganizationPicker) && activeKind ? (
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {submitLabel}
          </Button>
        ) : undefined
      }
      items={showOrganizationPicker ? replacementOrganizations : []}
      getItemKey={(organization) => organization.id}
      getItemToolbarLabel={(organization) => organization.name}
      getSearchText={(organization) =>
        [organization.name, getOrganizationKindLabel(organization.organizationKind)].join(' ')
      }
      renderItemHeader={(organization) => {
        const isSelected = selectedOrganizationId === organization.id
        const hasAvailableKind = organizationInverseSubjectHasAvailableKind(
          organization.id,
          location.id,
          availabilityKinds,
          orgRows,
          excludeRelationshipId,
        )
        const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

        return (
          <EntityItem
            density="compact"
            entity={buildOrganizationPickerEntitySummary(organization, {
              imageKey: organization.imageKey,
              description: !hasAvailableKind ? fullyLinkedReason : undefined,
            })}
            action={
              <CatalogPickerSelectionActions
                phase={phase}
                canSelect={hasAvailableKind}
                addLabel={isSelected ? 'Selected' : 'Select'}
                onAdd={() => {
                  setSelectedOrganizationId(organization.id)
                  if (!resolvedAddKind) {
                    setSelectedKind(null)
                  }
                }}
                onRemove={() => {
                  setSelectedOrganizationId(null)
                  if (!resolvedAddKind) {
                    setSelectedKind(null)
                  }
                }}
              />
            }
          />
        )
      }}
    />
  )
}
