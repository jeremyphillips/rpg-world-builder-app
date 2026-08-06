'use client'

import * as React from 'react'

import type {
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
  Organization,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { getOrganizationKindLabel } from '@rpg/contracts'
import { Button, CatalogPickerSheet, Eyebrow, SegmentedControl, Text } from '@rpg/ui'

import {
  CatalogPickerSelectionActions,
  catalogPickerShellProps,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { ContentEntityCard } from '../../lib/content-entity-card.client'
import { RelationshipDrawerContextHeader } from '../../lib/relationship/relationship-drawer-context-header.client'
import {
  CHARACTER_DRAWER_FULLY_LINKED_REASON,
  ORGANIZATION_DRAWER_FULLY_LINKED_REASONS,
  characterInverseSubjectHasAvailableKind,
  organizationDrawerIntentFromKind,
  organizationInverseSubjectHasAvailableKind,
} from '../../lib/location-connection-drawer-intent'
import { buildSubjectLocationConnectionKeySet } from '../../lib/location-connection-duplicate-keys'
import {
  resolveLocationInverseCharacterAddDrawerInstruction,
  resolveLocationInverseCharacterAddSubmitLabel,
  resolveLocationInverseOrganizationAddDrawerInstruction,
  resolveLocationInverseOrganizationAddSubmitLabel,
  resolveTerritorialAuthorityLocationContext,
} from '../lib/location-connection-surface-copy'
import type { LocationPartyCharacterOption } from '../lib/location-party-associations.lib'
import type {
  PeopleConnectionSubjectType,
  PeopleKindBinding,
  PeopleKindSlot,
} from '../lib/location-connected-parties-people-kind-slots'
import {
  resolvePeopleKindSlotAddLabel,
  resolvePeopleKindSlotBinding,
  resolvePeopleKindSlotSelectableSubjectTypes,
  resolvePeopleKindSlotSubjectTypeFieldLabel,
} from '../lib/location-connected-parties-people-kind-slots'

export type LocationInversePeopleConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  slot: PeopleKindSlot
  location: Location
  organizations: readonly Organization[]
  characters: readonly LocationPartyCharacterOption[]
  connectedPartyRows: readonly LocationConnectedPartyRow[]
  canAddOrganization: boolean
  canAddCharacter: boolean
  isSubmitting?: boolean
  onOrganizationSubmit: (input: {
    organizationId: string
    kind: OrganizationLocationConnectionKind
  }) => Promise<void>
  onCharacterSubmit: (input: {
    characterId: string
    kind: CharacterLocationConnectionKind
  }) => Promise<void>
}

const SUBJECT_TYPE_SEGMENT_OPTIONS = [
  { value: 'character' as const, label: 'Character' },
  { value: 'organization' as const, label: 'Organization' },
]

function resolveActiveBinding(
  slot: PeopleKindSlot,
  subjectType: PeopleConnectionSubjectType | null,
): PeopleKindBinding | undefined {
  if (!subjectType) {
    return undefined
  }
  return resolvePeopleKindSlotBinding(slot, subjectType)
}

export function LocationInversePeopleConnectionLinkDrawer(
  props: LocationInversePeopleConnectionLinkDrawerProps,
) {
  const remountKey = props.open ? props.slot.heading : 'closed'
  return <LocationInversePeopleConnectionLinkDrawerContent key={remountKey} {...props} />
}

// fallow-ignore-next-line complexity
function LocationInversePeopleConnectionLinkDrawerContent({
  open,
  onOpenChange,
  slot,
  location,
  organizations,
  characters,
  connectedPartyRows,
  canAddOrganization,
  canAddCharacter,
  isSubmitting = false,
  onOrganizationSubmit,
  onCharacterSubmit,
}: LocationInversePeopleConnectionLinkDrawerProps) {
  const selectableSubjectTypes = React.useMemo(
    () =>
      resolvePeopleKindSlotSelectableSubjectTypes({
        slot,
        canAddOrganization,
        canAddCharacter,
      }),
    [canAddCharacter, canAddOrganization, slot],
  )

  const [subjectType, setSubjectType] = React.useState<PeopleConnectionSubjectType | null>(
    selectableSubjectTypes[0] ?? null,
  )
  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      return
    }
    setSubjectType(selectableSubjectTypes[0] ?? null)
    setSelectedOrganizationId(null)
    setSelectedCharacterId(null)
  }, [open, selectableSubjectTypes, slot.heading])

  const activeBinding = resolveActiveBinding(slot, subjectType)
  const showSubjectTypeSegment = selectableSubjectTypes.length > 1

  const orgRows = React.useMemo(
    () => connectedPartyRows.filter((row) => row.subject.type === 'organization'),
    [connectedPartyRows],
  )

  const characterRows = React.useMemo(
    () => connectedPartyRows.filter((row) => row.subject.type === 'character'),
    [connectedPartyRows],
  )

  const characterExistingKeys = React.useMemo(
    () => buildSubjectLocationConnectionKeySet(characterRows),
    [characterRows],
  )

  const organizationKind =
    activeBinding?.subjectType === 'organization' ? activeBinding.kind : undefined
  const characterKind = activeBinding?.subjectType === 'character' ? activeBinding.kind : undefined

  const organizationIntent = organizationKind
    ? organizationDrawerIntentFromKind(organizationKind)
    : undefined

  const organizationAvailabilityKinds = organizationKind ? [organizationKind] : []
  const characterAvailabilityKinds = characterKind ? [characterKind] : []

  const instructionCopy = (() => {
    if (organizationKind) {
      return resolveLocationInverseOrganizationAddDrawerInstruction(organizationKind)
    }
    if (characterKind) {
      return resolveLocationInverseCharacterAddDrawerInstruction(characterKind)
    }
    return null
  })()

  const submitLabel = (() => {
    if (organizationKind) {
      return resolveLocationInverseOrganizationAddSubmitLabel(organizationKind)
    }
    if (characterKind) {
      return resolveLocationInverseCharacterAddSubmitLabel(characterKind)
    }
    return resolvePeopleKindSlotAddLabel(slot)
  })()

  const canSubmit = Boolean(
    !isSubmitting &&
    ((subjectType === 'organization' &&
      selectedOrganizationId &&
      organizationKind &&
      canAddOrganization) ||
      (subjectType === 'character' && selectedCharacterId && characterKind && canAddCharacter)),
  )

  const handleSubmit = async () => {
    if (subjectType === 'organization' && selectedOrganizationId && organizationKind) {
      await onOrganizationSubmit({ organizationId: selectedOrganizationId, kind: organizationKind })
      return
    }

    if (subjectType === 'character' && selectedCharacterId && characterKind) {
      await onCharacterSubmit({ characterId: selectedCharacterId, kind: characterKind })
    }
  }

  const handleSubjectTypeChange = (nextSubjectType: PeopleConnectionSubjectType) => {
    setSubjectType(nextSubjectType)
    setSelectedOrganizationId(null)
    setSelectedCharacterId(null)
  }

  const organizationFullyLinkedReason =
    organizationIntent != null
      ? ORGANIZATION_DRAWER_FULLY_LINKED_REASONS[organizationIntent]
      : 'All eligible connection types are already linked.'

  const headerBelowDescription = (
    <div className="space-y-4">
      <RelationshipDrawerContextHeader
        context={resolveTerritorialAuthorityLocationContext(location)}
      />
      {showSubjectTypeSegment ? (
        <div className="space-y-2">
          <Eyebrow size="sm" className="mb-0">
            {resolvePeopleKindSlotSubjectTypeFieldLabel(slot)}
          </Eyebrow>
          <SegmentedControl
            aria-label={resolvePeopleKindSlotSubjectTypeFieldLabel(slot)}
            value={subjectType}
            options={SUBJECT_TYPE_SEGMENT_OPTIONS.filter((option) =>
              selectableSubjectTypes.includes(option.value),
            )}
            onValueChange={handleSubjectTypeChange}
            fullWidth
          />
        </div>
      ) : null}
      {instructionCopy ? (
        <Text variant="muted" className="text-sm">
          {instructionCopy}
        </Text>
      ) : null}
    </div>
  )

  const sharedSheetProps = {
    open,
    onOpenChange,
    title: resolvePeopleKindSlotAddLabel(slot),
    ...catalogPickerShellProps(),
    rowLayout: 'entity-card' as const,
    headerBelowDescription,
    noResultsMessage: 'No matches for this search.',
  }

  if (subjectType === 'organization') {
    return (
      <CatalogPickerSheet
        {...sharedSheetProps}
        searchPlaceholder="Search organizations"
        noItemsMessage="No organizations are available."
        footer={
          selectedOrganizationId && organizationKind ? (
            <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
              {submitLabel}
            </Button>
          ) : undefined
        }
        items={organizations}
        getItemKey={(organization) => organization.id}
        getItemToolbarLabel={(organization) => organization.name}
        getSearchText={(organization) =>
          [organization.name, getOrganizationKindLabel(organization.organizationKind)].join(' ')
        }
        renderItemHeader={(organization) => {
          const isSelected = selectedOrganizationId === organization.id
          const hasAvailableKind =
            organizationKind != null &&
            organizationInverseSubjectHasAvailableKind(
              organization.id,
              location.id,
              organizationAvailabilityKinds,
              orgRows,
            )
          const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

          return (
            <ContentEntityCard
              chrome="embedded"
              density="compact"
              heading={organization.name}
              subheading={
                hasAvailableKind
                  ? getOrganizationKindLabel(organization.organizationKind)
                  : organizationFullyLinkedReason
              }
              imageKey={organization.imageKey}
              disabled={!hasAvailableKind}
              endSlot={
                <CatalogPickerSelectionActions
                  phase={phase}
                  canSelect={hasAvailableKind}
                  addLabel={isSelected ? 'Selected' : 'Select'}
                  onAdd={() => setSelectedOrganizationId(organization.id)}
                  onRemove={() => setSelectedOrganizationId(null)}
                />
              }
            />
          )
        }}
      />
    )
  }

  return (
    <CatalogPickerSheet
      {...sharedSheetProps}
      searchPlaceholder="Search characters"
      noItemsMessage="No characters are available."
      footer={
        selectedCharacterId && characterKind ? (
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {submitLabel}
          </Button>
        ) : undefined
      }
      items={characters}
      getItemKey={(character) => character.id}
      getItemToolbarLabel={(character) => character.name}
      getSearchText={(character) => [character.name, character.summary].join(' ')}
      renderItemHeader={(character) => {
        const isSelected = selectedCharacterId === character.id
        const hasAvailableKind =
          characterKind != null &&
          characterInverseSubjectHasAvailableKind(
            character.id,
            characterAvailabilityKinds,
            characterExistingKeys,
          )
        const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

        return (
          <ContentEntityCard
            chrome="embedded"
            density="compact"
            heading={character.name}
            subheading={
              hasAvailableKind
                ? character.summary || undefined
                : CHARACTER_DRAWER_FULLY_LINKED_REASON
            }
            disabled={!hasAvailableKind}
            endSlot={
              <CatalogPickerSelectionActions
                phase={phase}
                canSelect={hasAvailableKind}
                addLabel={isSelected ? 'Selected' : 'Select'}
                onAdd={() => setSelectedCharacterId(character.id)}
                onRemove={() => setSelectedCharacterId(null)}
              />
            }
          />
        )
      }}
    />
  )
}
