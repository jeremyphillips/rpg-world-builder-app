'use client'

import {
  getOrganizationKindLabel,
  type LocationPartyAssociation,
  type LocationPartyAssociationSemanticId,
  type LocationPartyKind,
  type LocationPartyRef,
  type Organization,
} from '@rpg/contracts'

import { resolveCatalogPickerRowActionPhase } from '@/features/character'
import { CatalogPickerItemHeader } from '@/features/character'
import { CatalogPickerSelectionActions } from '@/features/character'

import {
  buildLocationPartyAddActionLabel,
  buildLocationPartyAssociationExactKeyFromSelection,
  findLocationPartyAssociationId,
  isLocationPartyAssociationSelected,
  type LocationPartyCharacterOption,
} from '../lib/location-party-associations.lib'

type LocationPartyPickerItem =
  | { kind: 'character'; character: LocationPartyCharacterOption }
  | { kind: 'organization'; organization: Organization }

type LocationPartyPickerItemHeaderProps = {
  item: LocationPartyPickerItem
  semanticKey: LocationPartyAssociationSemanticId | null
  associations: readonly LocationPartyAssociation[]
  flashKeys: ReadonlySet<string>
  onSelectParty: (party: { kind: LocationPartyKind; id: string }) => void
  onRemoveParty: (associationId: string) => void
  onFlash: (exactKey: string) => void
}

export function LocationPartyPickerItemHeader({
  item,
  semanticKey,
  associations,
  flashKeys,
  onSelectParty,
  onRemoveParty,
  onFlash,
}: LocationPartyPickerItemHeaderProps) {
  if (!semanticKey) return null

  const party: LocationPartyRef =
    item.kind === 'character'
      ? { kind: 'character', characterId: item.character.id }
      : { kind: 'organization', organizationId: item.organization.id }

  const exactKey = buildLocationPartyAssociationExactKeyFromSelection({
    semanticKey,
    party,
  })
  const isSelected = isLocationPartyAssociationSelected({
    associations,
    semanticKey,
    party,
  })
  const isSuccess = flashKeys.has(exactKey)
  const phase = resolveCatalogPickerRowActionPhase({ isSuccess, isSelected })
  const associationId = findLocationPartyAssociationId({
    associations,
    semanticKey,
    party,
  })
  const addActionLabel = buildLocationPartyAddActionLabel(semanticKey)
  const name = item.kind === 'character' ? item.character.name : item.organization.name
  const metadata =
    item.kind === 'organization'
      ? getOrganizationKindLabel(item.organization.organizationKind)
      : item.character.summary

  return (
    <CatalogPickerItemHeader
      name={name}
      metadataLines={metadata ? [{ segments: [{ type: 'text', text: metadata }] }] : []}
      actions={
        <CatalogPickerSelectionActions
          phase={phase}
          canSelect={Boolean(semanticKey)}
          addLabel={addActionLabel}
          onAdd={() => {
            if (!semanticKey) return
            onSelectParty({
              kind: item.kind,
              id: item.kind === 'character' ? item.character.id : item.organization.id,
            })
            onFlash(exactKey)
          }}
          onRemove={() => {
            if (!associationId) return
            onRemoveParty(associationId)
          }}
        />
      }
    />
  )
}
