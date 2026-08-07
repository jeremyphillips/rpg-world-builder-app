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

import { LocationConnectionKindStep } from '../../components/location-connection-kind-step.client'
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
  buildPeopleSectionKindOptions,
  resolveActiveConnectionKind,
  resolvePeopleKindSlotFromOptionValue,
} from '../../lib/location-connection-kind-options'
import { LOCATION_PEOPLE_SECTION_SURFACE_COPY } from '../lib/location-connected-parties-section-copy'
import {
  resolveLocationInverseCharacterAddDrawerInstruction,
  resolveLocationInverseCharacterAddSubmitLabel,
  resolveLocationInverseCharacterTargetPresentation,
  resolveLocationInverseOrganizationAddDrawerInstruction,
  resolveLocationInverseOrganizationAddSubmitLabel,
  resolveLocationInverseOrganizationTargetPresentation,
  resolveTerritorialAuthorityLocationContext,
} from '../lib/location-connection-surface-copy'
import type { LocationConnectedPartyCharacterOption } from '../lib/location-connected-party-character-options.lib'
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
  kindSlots: readonly PeopleKindSlot[]
  location: Location
  organizations: readonly Organization[]
  characters: readonly LocationConnectedPartyCharacterOption[]
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

const PEOPLE_DRAWER_KIND_CHANGE_LABEL = 'Change'

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
  const remountKey = props.open ? `${props.location.id}:open` : 'closed'
  return <LocationInversePeopleConnectionLinkDrawerContent key={remountKey} {...props} />
}

// fallow-ignore-next-line complexity
function LocationInversePeopleConnectionLinkDrawerContent({
  open,
  onOpenChange,
  kindSlots,
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
  const organizationIds = React.useMemo(
    () => organizations.map((organization) => organization.id),
    [organizations],
  )
  const characterIds = React.useMemo(
    () => characters.map((character) => character.id),
    [characters],
  )

  const kindOptions = React.useMemo(
    () =>
      buildPeopleSectionKindOptions({
        kindSlots,
        locationId: location.id,
        rows: connectedPartyRows,
        organizationIds,
        characterIds,
        canAddOrganization,
        canAddCharacter,
      }),
    [
      canAddCharacter,
      canAddOrganization,
      characterIds,
      connectedPartyRows,
      kindSlots,
      location.id,
      organizationIds,
    ],
  )

  const [selectedSlotKey, setSelectedSlotKey] = React.useState<string | null>(null)
  const [subjectTypeOverride, setSubjectTypeOverride] =
    React.useState<PeopleConnectionSubjectType | null>(null)
  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = React.useState<string | null>(null)

  const activeSlotKey = resolveActiveConnectionKind(selectedSlotKey, kindOptions)
  const activeSlot = activeSlotKey
    ? resolvePeopleKindSlotFromOptionValue(kindSlots, activeSlotKey)
    : undefined

  const selectableSubjectTypes = React.useMemo(
    () =>
      activeSlot
        ? resolvePeopleKindSlotSelectableSubjectTypes({
            slot: activeSlot,
            canAddOrganization,
            canAddCharacter,
          })
        : [],
    [activeSlot, canAddCharacter, canAddOrganization],
  )

  const effectiveSubjectType = subjectTypeOverride ?? selectableSubjectTypes[0] ?? null
  const showSubjectTypeSegment = Boolean(activeSlot && selectableSubjectTypes.length > 1)
  const showEntityPicker = Boolean(activeSlot)
  const effectiveBinding = activeSlot
    ? resolveActiveBinding(activeSlot, effectiveSubjectType)
    : undefined

  const handleSlotKeyChange = (value: string) => {
    setSelectedSlotKey(value)
    setSubjectTypeOverride(null)
    setSelectedOrganizationId(null)
    setSelectedCharacterId(null)
  }

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
    effectiveBinding?.subjectType === 'organization' ? effectiveBinding.kind : undefined
  const characterKind =
    effectiveBinding?.subjectType === 'character' ? effectiveBinding.kind : undefined

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
    if (activeSlot) {
      return resolvePeopleKindSlotAddLabel(activeSlot)
    }
    return LOCATION_PEOPLE_SECTION_SURFACE_COPY.add
  })()

  const canSubmit = Boolean(
    !isSubmitting &&
    ((effectiveSubjectType === 'organization' &&
      selectedOrganizationId &&
      organizationKind &&
      canAddOrganization) ||
      (effectiveSubjectType === 'character' &&
        selectedCharacterId &&
        characterKind &&
        canAddCharacter)),
  )

  const handleSubmit = async () => {
    if (effectiveSubjectType === 'organization' && selectedOrganizationId && organizationKind) {
      await onOrganizationSubmit({ organizationId: selectedOrganizationId, kind: organizationKind })
      return
    }

    if (effectiveSubjectType === 'character' && selectedCharacterId && characterKind) {
      await onCharacterSubmit({ characterId: selectedCharacterId, kind: characterKind })
    }
  }

  const handleSubjectTypeChange = (nextSubjectType: PeopleConnectionSubjectType) => {
    setSubjectTypeOverride(nextSubjectType)
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
      {kindOptions.length > 0 ? (
        <LocationConnectionKindStep
          id="location-people-connection-kind"
          label={LOCATION_PEOPLE_SECTION_SURFACE_COPY.kindFieldLabel}
          options={kindOptions}
          value={activeSlotKey}
          onValueChange={handleSlotKeyChange}
          changeLabel={PEOPLE_DRAWER_KIND_CHANGE_LABEL}
        />
      ) : null}
      {showSubjectTypeSegment && activeSlot ? (
        <div className="space-y-2">
          <Eyebrow size="sm" className="mb-0">
            {resolvePeopleKindSlotSubjectTypeFieldLabel(activeSlot)}
          </Eyebrow>
          <SegmentedControl
            aria-label={resolvePeopleKindSlotSubjectTypeFieldLabel(activeSlot)}
            value={effectiveSubjectType}
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
      {!showEntityPicker ? (
        <Text variant="muted" className="text-sm" role="status">
          {LOCATION_PEOPLE_SECTION_SURFACE_COPY.chooseKindMessage}
        </Text>
      ) : null}
    </div>
  )

  const sharedSheetProps = {
    open,
    onOpenChange,
    title: LOCATION_PEOPLE_SECTION_SURFACE_COPY.addDrawerTitle,
    ...catalogPickerShellProps(),
    rowLayout: 'entity-card' as const,
    headerBelowDescription,
    searchDisabled: !showEntityPicker,
    pickerEnabled: showEntityPicker,
    noResultsMessage: 'No matches for this search.',
  }

  if (effectiveSubjectType === 'organization') {
    return (
      <CatalogPickerSheet
        {...sharedSheetProps}
        searchPlaceholder={
          resolveLocationInverseOrganizationTargetPresentation(organizationKind).searchPlaceholder
        }
        noItemsMessage="No organizations are available."
        footer={
          showEntityPicker && selectedOrganizationId && organizationKind ? (
            <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
              {submitLabel}
            </Button>
          ) : undefined
        }
        items={showEntityPicker ? organizations : []}
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
      searchPlaceholder={
        resolveLocationInverseCharacterTargetPresentation(characterKind).searchPlaceholder
      }
      noItemsMessage="No characters are available."
      footer={
        showEntityPicker && selectedCharacterId && characterKind ? (
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {submitLabel}
          </Button>
        ) : undefined
      }
      items={showEntityPicker ? characters : []}
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
