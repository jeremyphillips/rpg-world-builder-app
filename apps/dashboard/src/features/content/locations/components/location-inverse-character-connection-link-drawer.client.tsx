'use client'

import * as React from 'react'

import type {
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
} from '@rpg/contracts'
import { resolveLocationConnectionEligibility } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

import { LocationConnectionKindField } from '../../components/location-connection-kind-field.client'
import {
  CatalogPickerSelectionActions,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import {
  CHARACTER_DRAWER_FULLY_LINKED_REASON,
  LOCATION_INVERSE_CHARACTER_CHANGE_KIND_SUBMIT_LABEL,
  LOCATION_INVERSE_CHARACTER_CHANGE_KIND_TITLE,
  characterInverseSubjectHasAvailableKind,
} from '../../lib/relationship/location-connection/location-connection-drawer-intent'
import {
  CatalogEntityPickerSheet,
  createCatalogEntityRowRenderer,
} from '../../lib/content-entity-card.client'
import { buildCharacterPickerEntitySummary } from '../../lib/entity/content-entity-picker-presentation.lib'
import { DrawerContext } from '../../lib/relationship/drawer/drawer-context.client'
import { toDrawerContextEntity } from '../../lib/relationship/drawer/drawer-context.types'
import { toLocationConnectionEligibilityInput } from '../../lib/relationship/location-connection/location-connection-eligibility-input'
import {
  buildSubjectLocationConnectionKeySet,
  subjectLocationConnectionKey,
} from '../../lib/relationship/location-connection/location-connection-duplicate-keys'
import {
  buildCharacterInverseLocationConnectionKindOptions,
  LOCATION_CONNECTION_KIND_FIELD_LABEL,
  resolveActiveConnectionKind,
} from '../../lib/relationship/location-connection/location-connection-kind-options'
import {
  resolveLocationInverseCharacterAddDrawerInstruction,
  resolveLocationInverseCharacterAddDrawerTitle,
  resolveLocationInverseCharacterAddSubmitLabel,
  resolveLocationInverseCharacterTargetPresentation,
} from '../lib/location-connection-surface-copy'
import type { LocationConnectedPartyCharacterOption } from '../lib/location-connected-party-character-options.lib'
import {
  buildConnectedPartyCharacterEntitySummary,
  buildConnectedPartyCharacterPickerSearchText,
} from '../lib/location-connected-party-character-options.lib'
import { buildCharacterEntityContextPresentation } from '@/features/character'
import { buildLocationContextPresentationFromLocation } from '../lib/location-display'

export const LOCATION_INVERSE_CHARACTER_LINK_CHOOSE_SUBJECT_MESSAGE =
  'Choose a character to see available connection types.'

import type { RelationshipMutationMode } from '../../lib/relationship/list/relationship-mutation-mode'

export type LocationInverseCharacterConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: Extract<RelationshipMutationMode, 'add' | 'changeKind'>
  addKind?: CharacterLocationConnectionKind
  location: Location
  locationsById: ReadonlyMap<string, Location>
  campaignId: string
  characters: readonly LocationConnectedPartyCharacterOption[]
  connectedPartyRows: readonly LocationConnectedPartyRow[]
  initialConnection?: {
    relationshipId: string
    characterId: string
    kind: CharacterLocationConnectionKind
  }
  isSubmitting?: boolean
  onSubmit: (input: { characterId: string; kind: CharacterLocationConnectionKind }) => Promise<void>
}

export function LocationInverseCharacterConnectionLinkDrawer(
  props: LocationInverseCharacterConnectionLinkDrawerProps,
) {
  const remountKey = props.open
    ? `${props.mode}:${props.addKind ?? 'none'}:${props.initialConnection?.relationshipId ?? 'add'}`
    : 'closed'

  return <LocationInverseCharacterConnectionLinkDrawerContent key={remountKey} {...props} />
}

// fallow-ignore-next-line complexity
function LocationInverseCharacterConnectionLinkDrawerContent({
  open,
  onOpenChange,
  mode,
  addKind,
  location,
  locationsById,
  campaignId,
  characters,
  connectedPartyRows,
  initialConnection,
  isSubmitting = false,
  onSubmit,
}: LocationInverseCharacterConnectionLinkDrawerProps) {
  const resolvedAddKind = mode === 'add' && addKind != null ? addKind : undefined

  const [selectedCharacterId, setSelectedCharacterId] = React.useState<string | null>(
    initialConnection?.characterId ?? null,
  )
  const [selectedKind, setSelectedKind] = React.useState<CharacterLocationConnectionKind | null>(
    resolvedAddKind ?? initialConnection?.kind ?? null,
  )

  const characterRows = React.useMemo(
    () => connectedPartyRows.filter((row) => row.subjectType === 'character'),
    [connectedPartyRows],
  )

  const existingKeys = React.useMemo(
    () =>
      buildSubjectLocationConnectionKeySet(
        characterRows,
        mode === 'changeKind' ? initialConnection?.relationshipId : undefined,
      ),
    [characterRows, initialConnection?.relationshipId, mode],
  )

  const eligibleKinds = React.useMemo(
    () =>
      resolveLocationConnectionEligibility(toLocationConnectionEligibilityInput(location))
        .characterKinds,
    [location],
  )

  const kindOptions = React.useMemo(() => {
    if (resolvedAddKind) return []
    const characterId = selectedCharacterId ?? initialConnection?.characterId
    if (!characterId) return []
    const disabledKinds = new Set(
      eligibleKinds.filter((kind) =>
        existingKeys.has(subjectLocationConnectionKey(characterId, kind)),
      ),
    )
    return buildCharacterInverseLocationConnectionKindOptions({
      location,
      kinds: eligibleKinds,
      disabledKinds,
    })
  }, [
    eligibleKinds,
    existingKeys,
    initialConnection?.characterId,
    resolvedAddKind,
    selectedCharacterId,
  ])

  const activeKind = (() => {
    if (resolvedAddKind) return resolvedAddKind
    if (mode === 'changeKind') {
      return selectedKind ?? initialConnection?.kind ?? null
    }
    return resolveActiveConnectionKind(
      selectedKind,
      kindOptions,
    ) as CharacterLocationConnectionKind | null
  })()

  const showKindStep =
    (mode === 'changeKind' || (mode === 'add' && !resolvedAddKind)) &&
    Boolean(selectedCharacterId ?? initialConnection?.characterId)

  const lockedCharacter = React.useMemo(
    () =>
      mode === 'changeKind'
        ? characters.find((character) => character.id === initialConnection?.characterId)
        : undefined,
    [characters, initialConnection?.characterId, mode],
  )

  const showCharacterPicker = mode === 'add'

  const canSubmit = Boolean(selectedCharacterId && activeKind && !isSubmitting)

  const handleSubmit = async () => {
    if (!selectedCharacterId || !activeKind) return
    await onSubmit({ characterId: selectedCharacterId, kind: activeKind })
  }

  const title =
    mode === 'add' && resolvedAddKind
      ? resolveLocationInverseCharacterAddDrawerTitle(resolvedAddKind)
      : mode === 'add'
        ? 'Link character'
        : LOCATION_INVERSE_CHARACTER_CHANGE_KIND_TITLE

  const instructionCopy =
    mode === 'add' && resolvedAddKind
      ? resolveLocationInverseCharacterAddDrawerInstruction(resolvedAddKind)
      : null

  const submitLabel =
    mode === 'add' && resolvedAddKind
      ? resolveLocationInverseCharacterAddSubmitLabel(resolvedAddKind)
      : mode === 'add'
        ? 'Link character'
        : LOCATION_INVERSE_CHARACTER_CHANGE_KIND_SUBMIT_LABEL

  const availabilityKinds = resolvedAddKind ? [resolvedAddKind] : eligibleKinds

  const drawerContextEntities = React.useMemo(() => {
    const locationEntity = toDrawerContextEntity(
      buildLocationContextPresentationFromLocation(location, { locationsById, campaignId }),
    )

    if (mode === 'add') {
      return [locationEntity]
    }

    if (mode === 'changeKind') {
      const characterEntity = lockedCharacter
        ? toDrawerContextEntity(
            buildCharacterEntityContextPresentation(
              buildConnectedPartyCharacterEntitySummary(lockedCharacter),
            ),
          )
        : null

      return characterEntity ? [locationEntity, characterEntity] : [locationEntity]
    }

    return []
  }, [campaignId, location, locationsById, lockedCharacter, mode])

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      pickerEnabled={showCharacterPicker}
      searchPlaceholder={
        resolveLocationInverseCharacterTargetPresentation(activeKind).searchPlaceholder
      }
      noResultsMessage="No matches for this search."
      noItemsMessage="No characters are available."
      headerBelowDescription={
        <div className="space-y-4">
          <DrawerContext entities={drawerContextEntities} />
          {instructionCopy ? (
            <Text variant="muted" className="text-sm">
              {instructionCopy}
            </Text>
          ) : null}
          {showKindStep ? (
            <LocationConnectionKindField
              id="location-inverse-character-connection-kind"
              label={LOCATION_CONNECTION_KIND_FIELD_LABEL}
              options={kindOptions}
              value={activeKind}
              onValueChange={(value) => setSelectedKind(value as CharacterLocationConnectionKind)}
            />
          ) : null}
        </div>
      }
      emptyState={
        mode === 'add' && !selectedCharacterId ? (
          <Text variant="muted" className="text-sm" role="status">
            {LOCATION_INVERSE_CHARACTER_LINK_CHOOSE_SUBJECT_MESSAGE}
          </Text>
        ) : undefined
      }
      footer={
        activeKind && (mode === 'changeKind' || selectedCharacterId) ? (
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {submitLabel}
          </Button>
        ) : undefined
      }
      items={showCharacterPicker ? characters : []}
      getItemKey={(character) => character.id}
      getItemToolbarLabel={(character) => character.name}
      getSearchText={buildConnectedPartyCharacterPickerSearchText}
      renderEntityRow={createCatalogEntityRowRenderer({
        buildEntity: (character) =>
          buildCharacterPickerEntitySummary(character, {
            description: !characterInverseSubjectHasAvailableKind(
              character.id,
              availabilityKinds,
              existingKeys,
            )
              ? CHARACTER_DRAWER_FULLY_LINKED_REASON
              : undefined,
          }),
        buildTrailing: (character) => {
          const isSelected = selectedCharacterId === character.id
          const hasAvailableKind = characterInverseSubjectHasAvailableKind(
            character.id,
            availabilityKinds,
            existingKeys,
          )
          const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

          return {
            kind: 'action',
            content: (
              <CatalogPickerSelectionActions
                phase={phase}
                canSelect={hasAvailableKind}
                addLabel={isSelected ? 'Selected' : 'Select'}
                onAdd={() => {
                  setSelectedCharacterId(character.id)
                  if (!resolvedAddKind) {
                    setSelectedKind(null)
                  }
                }}
                onRemove={() => {
                  setSelectedCharacterId(null)
                  if (!resolvedAddKind) {
                    setSelectedKind(null)
                  }
                }}
              />
            ),
          }
        },
      })}
    />
  )
}
