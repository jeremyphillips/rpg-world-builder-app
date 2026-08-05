'use client'

import * as React from 'react'

import type {
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
} from '@rpg/contracts'
import { resolveLocationConnectionEligibility } from '@rpg/contracts'
import { Button, CatalogPickerSheet, SelectField, Text } from '@rpg/ui'

import { catalogPickerShellProps } from '@/features/character'

import { toLocationConnectionEligibilityInput } from '../../lib/location-connection-eligibility-input'
import {
  buildCharacterLocationConnectionKindOptions,
  LOCATION_CONNECTION_KIND_FIELD_LABEL,
} from '../../lib/location-connection-kind-options'
import {
  buildSubjectLocationConnectionKeySet,
  subjectLocationConnectionKey,
} from '../../lib/location-connection-duplicate-keys'
import type { LocationPartyCharacterOption } from '../lib/location-party-associations.lib'
import { LocationInverseCharacterLinkDrawerItem } from './location-inverse-character-link-drawer-item.client'

export const LOCATION_INVERSE_CHARACTER_LINK_DRAWER_ADD_TITLE = 'Link character'
export const LOCATION_INVERSE_CHARACTER_LINK_DRAWER_EDIT_TITLE = 'Edit character connection'
export const LOCATION_INVERSE_CHARACTER_LINK_SUBMIT_ADD_LABEL = 'Link character'
export const LOCATION_INVERSE_CHARACTER_LINK_SUBMIT_EDIT_LABEL = 'Save connection'
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

function characterHasAvailableKind(
  characterId: string,
  eligibleKinds: readonly CharacterLocationConnectionKind[],
  existingKeys: ReadonlySet<string>,
): boolean {
  return eligibleKinds.some(
    (kind) => !existingKeys.has(subjectLocationConnectionKey(characterId, kind)),
  )
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

  const activeKind =
    selectedKind && kindOptions.some((option) => option.value === selectedKind && !option.disabled)
      ? selectedKind
      : null

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
      searchPlaceholder="Search characters"
      noResultsMessage="No matches for this search."
      noItemsMessage="No characters are available."
      headerBelowDescription={
        selectedCharacterId ? (
          <SelectField
            id="location-inverse-character-connection-kind"
            label={LOCATION_CONNECTION_KIND_FIELD_LABEL}
            value={activeKind ?? ''}
            placeholder="Choose connection type…"
            options={kindOptions.map((option) => ({
              value: option.value,
              label: option.label,
              disabled: option.disabled,
              description: option.disabled ? option.disabledReason : option.description,
            }))}
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
          <div className="flex justify-end border-t border-border px-4 py-3">
            <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
              {mode === 'add'
                ? LOCATION_INVERSE_CHARACTER_LINK_SUBMIT_ADD_LABEL
                : LOCATION_INVERSE_CHARACTER_LINK_SUBMIT_EDIT_LABEL}
            </Button>
          </div>
        ) : null
      }
      items={characters}
      getItemKey={(character) => character.id}
      getItemToolbarLabel={(character) => character.name}
      getSearchText={(character) => [character.name, character.summary].join(' ')}
      renderItemHeader={(character) => (
        <LocationInverseCharacterLinkDrawerItem
          character={character}
          isSelected={selectedCharacterId === character.id}
          hasAvailableKind={characterHasAvailableKind(character.id, eligibleKinds, existingKeys)}
          onSelect={() => {
            setSelectedCharacterId(character.id)
            setSelectedKind(null)
          }}
          onClear={() => {
            setSelectedCharacterId(null)
            setSelectedKind(null)
          }}
        />
      )}
    />
  )
}
