'use client'

import * as React from 'react'

import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
  Organization,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { getOrganizationDomainLabel } from '@rpg/contracts'
import {
  Button,
  Eyebrow,
  SegmentedControl,
  SelectionSummaryCard,
  SelectionSummaryChangeAction,
  Text,
} from '@rpg/ui'

import {
  CatalogPickerSelectionActions,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { LocationConnectionKindField } from '../../components/location-connection-kind-field.client'
import {
  CatalogEntityPickerSheet,
  createCatalogEntityRowRenderer,
} from '../../lib/content-entity-card.client'
import {
  buildCharacterPickerEntitySummary,
  buildOrganizationPickerEntitySummary,
} from '../../lib/entity/content-entity-picker-presentation.lib'
import { DrawerContext } from '../../lib/relationship/drawer/drawer-context.client'
import { applyPeopleKindSlotDownstreamState } from '../../lib/relationship/location-connection/apply-people-kind-slot-downstream-state.lib'
import { toDrawerContextEntity } from '../../lib/relationship/drawer/drawer-context.types'
import {
  CHARACTER_DRAWER_FULLY_LINKED_REASON,
  ORGANIZATION_DRAWER_FULLY_LINKED_REASONS,
  RELATIONSHIP_DRAWER_KIND_SUMMARY_CHANGE_LABEL,
  RELATIONSHIP_DRAWER_SELECTIONS_EYEBROW,
  characterInverseSubjectHasAvailableKind,
  organizationDrawerIntentFromKind,
  organizationInverseSubjectHasAvailableKind,
} from '../../lib/relationship/location-connection/location-connection-drawer-intent'
import { buildSubjectLocationConnectionKeySet } from '../../lib/relationship/location-connection/location-connection-duplicate-keys'
import {
  buildPeopleSectionKindOptions,
  canReopenConnectionKindDecision,
  resolveActiveConnectionKind,
  resolvePeopleKindSlotFromOptionValue,
} from '../../lib/relationship/location-connection/location-connection-kind-options'
import { LOCATION_PEOPLE_SECTION_SURFACE_COPY } from '../lib/connected-parties/location-connected-parties-section-copy'
import {
  resolveLocationInverseCharacterAddDrawerInstruction,
  resolveLocationInverseCharacterAddSubmitLabel,
  resolveLocationInverseCharacterTargetPresentation,
  resolveLocationInverseOrganizationAddDrawerInstruction,
  resolveLocationInverseOrganizationAddSubmitLabel,
  resolveLocationInverseOrganizationTargetPresentation,
} from '../lib/connected-parties/location-connection-surface-copy'
import type { LocationConnectedPartyCharacterOption } from '../lib/connected-parties/location-connected-party-character-options.lib'
import { buildConnectedPartyCharacterPickerSearchText } from '../lib/connected-parties/location-connected-party-character-options.lib'
import type {
  PeopleConnectionSubjectType,
  PeopleKindBinding,
  PeopleKindSlot,
} from '../lib/connected-parties/location-connected-parties-people-kind-slots'
import {
  resolvePeopleKindSlotAddLabel,
  resolvePeopleKindSlotBinding,
  resolvePeopleKindSlotSelectableSubjectTypes,
  resolvePeopleKindSlotSubjectTypeFieldLabel,
} from '../lib/connected-parties/location-connected-parties-people-kind-slots'
import { buildLocationContextPresentationFromLocation } from '../lib/location-display'
import { ORGANIZATION_MEMBER_PICKER_CREATE_NPC_UNAVAILABLE_MESSAGE } from '../../organizations/components/organization-member-picker-drawer.client'
import {
  revalidateCreatedNpcForInverseDrawer,
  revalidateCreatedOrganizationForInverseDrawer,
  resolveRelationshipPickerCharacterCreateIntents,
  resolveRelationshipPickerOrganizationCreateIntents,
} from '../../lib/relationship/picker/relationship-picker-nested-create.lib'
import { useRelationshipPickerNestedCreate } from '../../lib/relationship/picker/use-relationship-picker-nested-create.client'

export type LocationInversePeopleConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  kindSlots: readonly PeopleKindSlot[]
  location: Location
  locationsById: ReadonlyMap<string, Location>
  campaignId: string
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
  quickNpc?: {
    buildContext: CharacterBuildContext | null
    buildContextFailed: boolean
    buildContextReady: boolean
    catalogIndex?: CharacterBuildCatalogIndex | null
  }
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
  const remountKey = props.open ? `${props.location.id}:open` : 'closed'
  return <LocationInversePeopleConnectionLinkDrawerContent key={remountKey} {...props} />
}

// fallow-ignore-next-line complexity
function LocationInversePeopleConnectionLinkDrawerContent({
  open,
  onOpenChange,
  kindSlots,
  location,
  locationsById,
  campaignId,
  organizations,
  characters,
  connectedPartyRows,
  canAddOrganization,
  canAddCharacter,
  isSubmitting = false,
  onOrganizationSubmit,
  onCharacterSubmit,
  quickNpc,
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
        location,
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
      location,
      organizationIds,
    ],
  )

  const [selectedSlotKey, setSelectedSlotKey] = React.useState<string | null>(null)
  const [subjectTypeOverride, setSubjectTypeOverride] =
    React.useState<PeopleConnectionSubjectType | null>(null)
  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string | null>(null)
  const [selectedCharacterId, setSelectedCharacterId] = React.useState<string | null>(null)
  const [editingKind, setEditingKind] = React.useState(false)

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
  const canEditKind = canReopenConnectionKindDecision(kindOptions)
  const kindDecisionComplete = Boolean(activeSlotKey)
  const showKindField =
    kindOptions.length > 0 &&
    (!kindDecisionComplete || editingKind || (kindDecisionComplete && !canEditKind))
  const showKindSummary = canEditKind && kindDecisionComplete && !editingKind
  const selectedKindOption = kindOptions.find((option) => option.value === activeSlotKey)
  const kindFieldLabel = LOCATION_PEOPLE_SECTION_SURFACE_COPY.kindFieldLabel
  const kindChangeAriaLabel = RELATIONSHIP_DRAWER_KIND_SUMMARY_CHANGE_LABEL
  const showSubjectTypeSegment = Boolean(
    activeSlot && selectableSubjectTypes.length > 1 && !editingKind,
  )
  const showEntityPicker = Boolean(activeSlot && !editingKind)
  const effectiveBinding = activeSlot
    ? resolveActiveBinding(activeSlot, effectiveSubjectType)
    : undefined

  const orgRows = React.useMemo(
    () => connectedPartyRows.filter((row) => row.subjectType === 'organization'),
    [connectedPartyRows],
  )

  const characterRows = React.useMemo(
    () => connectedPartyRows.filter((row) => row.subjectType === 'character'),
    [connectedPartyRows],
  )

  const handleSlotKeyChange = (value: string) => {
    if (activeSlotKey === value) {
      setEditingKind(false)
      return
    }

    const nextSlot = resolvePeopleKindSlotFromOptionValue(kindSlots, value)
    setSelectedSlotKey(value)
    setEditingKind(false)

    if (!nextSlot) {
      setSubjectTypeOverride(null)
      setSelectedOrganizationId(null)
      setSelectedCharacterId(null)
      return
    }

    const downstream = applyPeopleKindSlotDownstreamState({
      nextSlot,
      locationId: location.id,
      canAddOrganization,
      canAddCharacter,
      subjectTypeOverride,
      selectedOrganizationId,
      selectedCharacterId,
      orgRows,
      characterRows,
    })

    setSubjectTypeOverride(downstream.subjectTypeOverride)
    setSelectedOrganizationId(downstream.selectedOrganizationId)
    setSelectedCharacterId(downstream.selectedCharacterId)
  }

  const startEditingKind = () => {
    if (!canEditKind) return
    setEditingKind(true)
  }

  const characterExistingKeys = React.useMemo(
    () => buildSubjectLocationConnectionKeySet(characterRows),
    [characterRows],
  )

  const organizationDomain =
    effectiveBinding?.subjectType === 'organization' ? effectiveBinding.kind : undefined
  const characterKind =
    effectiveBinding?.subjectType === 'character' ? effectiveBinding.kind : undefined

  const organizationIntent = organizationDomain
    ? organizationDrawerIntentFromKind(organizationDomain)
    : undefined

  const organizationAvailabilityKinds = React.useMemo(
    () => (organizationDomain ? [organizationDomain] : []),
    [organizationDomain],
  )
  const characterAvailabilityKinds = React.useMemo(
    () => (characterKind ? [characterKind] : []),
    [characterKind],
  )

  const instructionCopy = (() => {
    if (organizationDomain) {
      return resolveLocationInverseOrganizationAddDrawerInstruction(organizationDomain)
    }
    if (characterKind) {
      return resolveLocationInverseCharacterAddDrawerInstruction(characterKind)
    }
    return null
  })()

  const submitLabel = (() => {
    if (organizationDomain) {
      return resolveLocationInverseOrganizationAddSubmitLabel(organizationDomain)
    }
    if (characterKind) {
      return resolveLocationInverseCharacterAddSubmitLabel(characterKind)
    }
    if (activeSlot) {
      return resolvePeopleKindSlotAddLabel(activeSlot)
    }
    return LOCATION_PEOPLE_SECTION_SURFACE_COPY.add
  })()

  const nestedCreateIntents = React.useMemo(() => {
    if (
      effectiveSubjectType !== 'organization' ||
      !showEntityPicker ||
      editingKind ||
      !organizationDomain ||
      !canAddOrganization
    ) {
      return []
    }

    return resolveRelationshipPickerOrganizationCreateIntents({
      locationId: location.id,
      kinds: organizationAvailabilityKinds,
      orgRows,
    })
  }, [
    canAddOrganization,
    editingKind,
    effectiveSubjectType,
    location.id,
    organizationAvailabilityKinds,
    orgRows,
    organizationDomain,
    showEntityPicker,
  ])

  const nestedCreate = useRelationshipPickerNestedCreate({
    campaignId,
    enabled:
      effectiveSubjectType === 'organization' &&
      showEntityPicker &&
      !editingKind &&
      Boolean(organizationDomain) &&
      canAddOrganization,
    createIntents: nestedCreateIntents,
    locationId: location.id,
    onSelectCreatedOrganization: setSelectedOrganizationId,
    revalidateCreatedOrganization: (organization, freshOrgRows) => {
      if (!organizationDomain) {
        return false
      }

      return revalidateCreatedOrganizationForInverseDrawer({
        organization,
        locationId: location.id,
        kinds: organizationAvailabilityKinds,
        orgRows: freshOrgRows,
      })
    },
  })

  const characterNestedCreateIntents = React.useMemo(() => {
    if (
      effectiveSubjectType !== 'character' ||
      !showEntityPicker ||
      editingKind ||
      !characterKind ||
      !canAddCharacter
    ) {
      return []
    }

    return resolveRelationshipPickerCharacterCreateIntents({
      createableCharacterTypes: ['npc'],
    })
  }, [canAddCharacter, characterKind, editingKind, effectiveSubjectType, showEntityPicker])

  const characterNestedCreate = useRelationshipPickerNestedCreate({
    campaignId,
    enabled:
      effectiveSubjectType === 'character' &&
      showEntityPicker &&
      !editingKind &&
      Boolean(characterKind) &&
      canAddCharacter &&
      Boolean(quickNpc?.buildContextReady) &&
      !quickNpc?.buildContextFailed,
    createIntents: characterNestedCreateIntents,
    locationId: location.id,
    npcBuildContext: quickNpc?.buildContext ?? null,
    npcCatalogIndex: quickNpc?.catalogIndex,
    onSelectCreatedNpc: setSelectedCharacterId,
    revalidateCreatedNpc: (character) => {
      if (!characterKind) {
        return false
      }

      return revalidateCreatedNpcForInverseDrawer({
        character,
        kinds: characterAvailabilityKinds,
        existingKeys: characterExistingKeys,
      })
    },
  })

  const {
    auxiliaryAction: nestedCreateAuxiliaryAction,
    modals: nestedCreateModals,
    nestedCreateBusy,
  } = nestedCreate

  const {
    auxiliaryAction: characterNestedCreateAuxiliaryAction,
    modals: characterNestedCreateModals,
    nestedCreateBusy: characterNestedCreateBusy,
  } = characterNestedCreate

  const characterAuxiliaryAction = (() => {
    if (!characterNestedCreateIntents.length) {
      return undefined
    }
    if (quickNpc?.buildContextFailed) {
      return {
        state: 'unavailable' as const,
        message: ORGANIZATION_MEMBER_PICKER_CREATE_NPC_UNAVAILABLE_MESSAGE,
      }
    }
    return characterNestedCreateAuxiliaryAction
  })()

  const effectiveNestedCreateBusy = nestedCreateBusy || characterNestedCreateBusy

  const canSubmit = Boolean(
    !isSubmitting &&
    !effectiveNestedCreateBusy &&
    ((effectiveSubjectType === 'organization' &&
      selectedOrganizationId &&
      organizationDomain &&
      canAddOrganization) ||
      (effectiveSubjectType === 'character' &&
        selectedCharacterId &&
        characterKind &&
        canAddCharacter)),
  )

  const handleSubmit = async () => {
    if (effectiveSubjectType === 'organization' && selectedOrganizationId && organizationDomain) {
      await onOrganizationSubmit({
        organizationId: selectedOrganizationId,
        kind: organizationDomain,
      })
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

  const drawerContextEntities = React.useMemo(
    () => [
      toDrawerContextEntity(
        buildLocationContextPresentationFromLocation(location, { locationsById, campaignId }),
      ),
    ],
    [campaignId, location, locationsById],
  )

  const headerBelowDescription = (
    <div className="space-y-4">
      <DrawerContext entities={drawerContextEntities} />
      {showKindField ? (
        <LocationConnectionKindField
          id="location-people-connection-kind"
          label={kindFieldLabel}
          options={kindOptions}
          value={activeSlotKey}
          onValueChange={handleSlotKeyChange}
        />
      ) : null}
      {showKindSummary && selectedKindOption ? (
        <SelectionSummaryCard
          eyebrow={RELATIONSHIP_DRAWER_SELECTIONS_EYEBROW}
          rows={[
            {
              label: kindFieldLabel,
              value: selectedKindOption.label,
              onValueClick: startEditingKind,
              valueActionAriaLabel: kindChangeAriaLabel,
              action: (
                <SelectionSummaryChangeAction
                  changeLabel={RELATIONSHIP_DRAWER_KIND_SUMMARY_CHANGE_LABEL}
                  ariaLabel={kindChangeAriaLabel}
                  onChange={startEditingKind}
                />
              ),
            },
          ]}
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
      {instructionCopy && !editingKind ? (
        <Text variant="muted" className="text-sm">
          {instructionCopy}
        </Text>
      ) : null}
      {!activeSlotKey ? (
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
    headerBelowDescription,
    searchDisabled: !showEntityPicker,
    pickerEnabled: showEntityPicker,
    noResultsMessage: 'No matches for this search.',
  }

  if (effectiveSubjectType === 'organization') {
    return (
      <>
        {nestedCreateModals}
        <CatalogEntityPickerSheet
          {...sharedSheetProps}
          auxiliaryAction={nestedCreateAuxiliaryAction}
          searchPlaceholder={
            resolveLocationInverseOrganizationTargetPresentation(organizationDomain)
              .searchPlaceholder
          }
          noItemsMessage="No organizations are available."
          footer={
            showEntityPicker && !editingKind && selectedOrganizationId && organizationDomain ? (
              <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
                {submitLabel}
              </Button>
            ) : undefined
          }
          items={showEntityPicker ? organizations : []}
          getItemKey={(organization) => organization.id}
          getItemToolbarLabel={(organization) => organization.name}
          getSearchText={(organization) =>
            [organization.name, getOrganizationDomainLabel(organization.organizationDomain)].join(
              ' ',
            )
          }
          renderEntityRow={createCatalogEntityRowRenderer({
            buildEntity: (organization) =>
              buildOrganizationPickerEntitySummary(organization, {
                imageKey: organization.imageKey,
                description:
                  organizationDomain != null &&
                  !organizationInverseSubjectHasAvailableKind(
                    organization.id,
                    location.id,
                    organizationAvailabilityKinds,
                    orgRows,
                  )
                    ? organizationFullyLinkedReason
                    : undefined,
              }),
            buildTrailing: (organization) => {
              const isSelected = selectedOrganizationId === organization.id
              const hasAvailableKind =
                organizationDomain != null &&
                organizationInverseSubjectHasAvailableKind(
                  organization.id,
                  location.id,
                  organizationAvailabilityKinds,
                  orgRows,
                )
              const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

              return {
                kind: 'action',
                content: (
                  <CatalogPickerSelectionActions
                    phase={phase}
                    canSelect={hasAvailableKind}
                    addLabel={isSelected ? 'Selected' : 'Select'}
                    onAdd={() => setSelectedOrganizationId(organization.id)}
                    onRemove={() => setSelectedOrganizationId(null)}
                  />
                ),
              }
            },
          })}
        />
      </>
    )
  }

  return (
    <>
      {characterNestedCreateModals}
      <CatalogEntityPickerSheet
        {...sharedSheetProps}
        auxiliaryAction={characterAuxiliaryAction}
        searchPlaceholder={
          resolveLocationInverseCharacterTargetPresentation(characterKind).searchPlaceholder
        }
        noItemsMessage="No characters are available."
        footer={
          showEntityPicker && !editingKind && selectedCharacterId && characterKind ? (
            <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
              {submitLabel}
            </Button>
          ) : undefined
        }
        items={showEntityPicker ? characters : []}
        getItemKey={(character) => character.id}
        getItemToolbarLabel={(character) => character.name}
        getSearchText={buildConnectedPartyCharacterPickerSearchText}
        renderEntityRow={createCatalogEntityRowRenderer({
          buildEntity: (character) =>
            buildCharacterPickerEntitySummary(character, {
              description:
                characterKind != null &&
                !characterInverseSubjectHasAvailableKind(
                  character.id,
                  characterAvailabilityKinds,
                  characterExistingKeys,
                )
                  ? CHARACTER_DRAWER_FULLY_LINKED_REASON
                  : undefined,
            }),
          buildTrailing: (character) => {
            const isSelected = selectedCharacterId === character.id
            const hasAvailableKind =
              characterKind != null &&
              characterInverseSubjectHasAvailableKind(
                character.id,
                characterAvailabilityKinds,
                characterExistingKeys,
              )
            const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

            return {
              kind: 'action',
              content: (
                <CatalogPickerSelectionActions
                  phase={phase}
                  canSelect={hasAvailableKind}
                  addLabel={isSelected ? 'Selected' : 'Select'}
                  onAdd={() => setSelectedCharacterId(character.id)}
                  onRemove={() => setSelectedCharacterId(null)}
                />
              ),
            }
          },
        })}
      />
    </>
  )
}
