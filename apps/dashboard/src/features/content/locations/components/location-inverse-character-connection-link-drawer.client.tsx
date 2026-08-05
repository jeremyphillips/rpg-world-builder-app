'use client'

import * as React from 'react'

import type {
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
} from '@rpg/contracts'
import { resolveLocationConnectionEligibility } from '@rpg/contracts'
import { Button, CatalogPickerSheet, Text } from '@rpg/ui'

import { LocationConnectionKindStep } from '../../components/location-connection-kind-step.client'
import {
  CatalogPickerSelectionActions,
  catalogPickerShellProps,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import {
  CHARACTER_DRAWER_FULLY_LINKED_REASON,
  characterInverseSubjectHasAvailableKind,
} from '../../lib/location-connection-drawer-intent'
import { ContentEntityCard } from '../../lib/content-entity-card.client'
import { toLocationConnectionEligibilityInput } from '../../lib/location-connection-eligibility-input'
import {
  buildSubjectLocationConnectionKeySet,
  subjectLocationConnectionKey,
} from '../../lib/location-connection-duplicate-keys'
import {
  buildCharacterLocationConnectionKindOptions,
  LOCATION_CONNECTION_KIND_FIELD_LABEL,
  resolveActiveConnectionKind,
} from '../../lib/location-connection-kind-options'
import type { LocationPartyCharacterOption } from '../lib/location-party-associations.lib'

export const LOCATION_INVERSE_CHARACTER_LINK_DRAWER_ADD_TITLE = 'Link character'
export const LOCATION_INVERSE_CHARACTER_LINK_DRAWER_EDIT_TITLE = 'Edit character connection'
export const LOCATION_INVERSE_CHARACTER_LINK_SUBMIT_ADD_LABEL = 'Link character'
export const LOCATION_INVERSE_CHARACTER_LINK_CHOOSE_SUBJECT_MESSAGE =
  'Choose a character to see available connection types.'

export type LocationInverseCharacterConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  location: Location
  characters: readonly LocationPartyCharacterOption[]
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
    ? `${props.mode}:${props.initialConnection?.relationshipId ?? 'add'}`
    : 'closed'

  return <LocationInverseCharacterConnectionLinkDrawerContent key={remountKey} {...props} />
}

// fallow-ignore-next-line complexity
function LocationInverseCharacterConnectionLinkDrawerContent({
  open,
  onOpenChange,
  mode,
  location,
  characters,
  connectedPartyRows,
  initialConnection,
  isSubmitting = false,
  onSubmit,
}: LocationInverseCharacterConnectionLinkDrawerProps) {
  const [selectedCharacterId, setSelectedCharacterId] = React.useState<string | null>(
    initialConnection?.characterId ?? null,
  )
  const [selectedKind, setSelectedKind] = React.useState<CharacterLocationConnectionKind | null>(
    initialConnection?.kind ?? null,
  )

  const characterRows = React.useMemo(
    () => connectedPartyRows.filter((row) => row.subject.type === 'character'),
    [connectedPartyRows],
  )

  const existingKeys = React.useMemo(
    () =>
      buildSubjectLocationConnectionKeySet(
        characterRows,
        mode === 'edit' ? initialConnection?.relationshipId : undefined,
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
    if (!selectedCharacterId) return []
    const disabledKinds = new Set(
      eligibleKinds.filter((kind) =>
        existingKeys.has(subjectLocationConnectionKey(selectedCharacterId, kind)),
      ),
    )
    return buildCharacterLocationConnectionKindOptions(eligibleKinds, disabledKinds)
  }, [eligibleKinds, existingKeys, selectedCharacterId])

  const activeKind = resolveActiveConnectionKind(
    selectedKind,
    kindOptions,
  ) as CharacterLocationConnectionKind | null

  const canSubmit = Boolean(selectedCharacterId && activeKind && !isSubmitting)

  const handleSubmit = async () => {
    if (!selectedCharacterId || !activeKind) return
    await onSubmit({ characterId: selectedCharacterId, kind: activeKind })
  }

  const title =
    mode === 'add'
      ? LOCATION_INVERSE_CHARACTER_LINK_DRAWER_ADD_TITLE
      : LOCATION_INVERSE_CHARACTER_LINK_DRAWER_EDIT_TITLE

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      {...catalogPickerShellProps()}
      rowLayout="entity-card"
      searchPlaceholder="Search characters"
      noResultsMessage="No matches for this search."
      noItemsMessage="No characters are available."
      headerBelowDescription={
        selectedCharacterId ? (
          <LocationConnectionKindStep
            id="location-inverse-character-connection-kind"
            label={LOCATION_CONNECTION_KIND_FIELD_LABEL}
            options={kindOptions}
            value={activeKind}
            onValueChange={(value) => setSelectedKind(value as CharacterLocationConnectionKind)}
          />
        ) : null
      }
      emptyState={
        !selectedCharacterId ? (
          <Text variant="muted" className="text-sm" role="status">
            {LOCATION_INVERSE_CHARACTER_LINK_CHOOSE_SUBJECT_MESSAGE}
          </Text>
        ) : undefined
      }
      footer={
        selectedCharacterId ? (
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {mode === 'add' ? LOCATION_INVERSE_CHARACTER_LINK_SUBMIT_ADD_LABEL : 'Save connection'}
          </Button>
        ) : undefined
      }
      items={characters}
      getItemKey={(character) => character.id}
      getItemToolbarLabel={(character) => character.name}
      getSearchText={(character) => [character.name, character.summary].join(' ')}
      renderItemHeader={(character) => {
        const isSelected = selectedCharacterId === character.id
        const hasAvailableKind = characterInverseSubjectHasAvailableKind(
          character.id,
          eligibleKinds,
          existingKeys,
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
                onAdd={() => {
                  setSelectedCharacterId(character.id)
                  setSelectedKind(null)
                }}
                onRemove={() => {
                  setSelectedCharacterId(null)
                  setSelectedKind(null)
                }}
              />
            }
          />
        )
      }}
    />
  )
}
