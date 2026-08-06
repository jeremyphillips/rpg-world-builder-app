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
  LOCATION_INVERSE_CHARACTER_CHANGE_KIND_SUBMIT_LABEL,
  LOCATION_INVERSE_CHARACTER_CHANGE_KIND_TITLE,
  characterInverseSubjectHasAvailableKind,
} from '../../lib/location-connection-drawer-intent'
import { ContentEntityCard } from '../../lib/content-entity-card.client'
import { RelationshipDrawerContextHeader } from '../../lib/relationship/relationship-drawer-context-header.client'
import { RELATIONSHIP_DRAWER_CHARACTER_FIELD_LABEL } from '../../lib/relationship/relationship-drawer-field-labels'
import { RelationshipDrawerSubjectField } from '../../lib/relationship/relationship-drawer-subject-field.client'
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
import {
  resolveLocationInverseCharacterAddDrawerInstruction,
  resolveLocationInverseCharacterAddDrawerTitle,
  resolveLocationInverseCharacterAddSubmitLabel,
  resolveTerritorialAuthorityLocationContext,
} from '../lib/location-connection-surface-copy'
import type { LocationPartyCharacterOption } from '../lib/location-party-associations.lib'

export const LOCATION_INVERSE_CHARACTER_LINK_CHOOSE_SUBJECT_MESSAGE =
  'Choose a character to see available connection types.'

export type LocationInverseCharacterConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  addKind?: CharacterLocationConnectionKind
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
    if (resolvedAddKind) return []
    const characterId = selectedCharacterId ?? initialConnection?.characterId
    if (!characterId) return []
    const disabledKinds = new Set(
      eligibleKinds.filter((kind) =>
        existingKeys.has(subjectLocationConnectionKey(characterId, kind)),
      ),
    )
    return buildCharacterLocationConnectionKindOptions(eligibleKinds, disabledKinds)
  }, [
    eligibleKinds,
    existingKeys,
    initialConnection?.characterId,
    resolvedAddKind,
    selectedCharacterId,
  ])

  const activeKind = (() => {
    if (resolvedAddKind) return resolvedAddKind
    if (mode === 'edit') {
      return selectedKind ?? initialConnection?.kind ?? null
    }
    return resolveActiveConnectionKind(
      selectedKind,
      kindOptions,
    ) as CharacterLocationConnectionKind | null
  })()

  const showKindStep =
    (mode === 'edit' || (mode === 'add' && !resolvedAddKind)) &&
    Boolean(selectedCharacterId ?? initialConnection?.characterId)

  const lockedCharacter = React.useMemo(
    () =>
      mode === 'edit'
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

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      {...catalogPickerShellProps()}
      rowLayout="entity-card"
      searchPlaceholder="Search characters"
      searchDisabled={!showCharacterPicker}
      noResultsMessage="No matches for this search."
      noItemsMessage="No characters are available."
      headerBelowDescription={
        <div className="space-y-4">
          <RelationshipDrawerContextHeader
            context={resolveTerritorialAuthorityLocationContext(location)}
          />
          {mode === 'edit' && lockedCharacter ? (
            <RelationshipDrawerSubjectField
              label={RELATIONSHIP_DRAWER_CHARACTER_FIELD_LABEL}
              value={lockedCharacter.name}
            />
          ) : null}
          {instructionCopy ? (
            <Text variant="muted" className="text-sm">
              {instructionCopy}
            </Text>
          ) : null}
          {showKindStep ? (
            <LocationConnectionKindStep
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
        activeKind && (mode === 'edit' || selectedCharacterId) ? (
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {submitLabel}
          </Button>
        ) : undefined
      }
      items={showCharacterPicker ? characters : []}
      getItemKey={(character) => character.id}
      getItemToolbarLabel={(character) => character.name}
      getSearchText={(character) => [character.name, character.summary].join(' ')}
      renderItemHeader={(character) => {
        const isSelected = selectedCharacterId === character.id
        const hasAvailableKind = characterInverseSubjectHasAvailableKind(
          character.id,
          availabilityKinds,
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
            }
          />
        )
      }}
    />
  )
}
