'use client'

import {
  CatalogPickerItemHeader,
  CatalogPickerSelectionActions,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { CHARACTER_DRAWER_FULLY_LINKED_REASON } from '../../lib/location-connection-drawer-intent'
import type { LocationPartyCharacterOption } from '../lib/location-party-associations.lib'

type LocationInverseCharacterLinkDrawerItemProps = {
  character: LocationPartyCharacterOption
  isSelected: boolean
  hasAvailableKind: boolean
  onSelect: () => void
  onClear: () => void
}

export function LocationInverseCharacterLinkDrawerItem({
  character,
  isSelected,
  hasAvailableKind,
  onSelect,
  onClear,
}: LocationInverseCharacterLinkDrawerItemProps) {
  const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

  return (
    <CatalogPickerItemHeader
      name={character.name}
      metadataLines={
        character.summary
          ? [
              {
                segments: [
                  {
                    type: 'text',
                    text: hasAvailableKind
                      ? character.summary
                      : CHARACTER_DRAWER_FULLY_LINKED_REASON,
                  },
                ],
              },
            ]
          : hasAvailableKind
            ? []
            : [
                {
                  segments: [
                    {
                      type: 'text',
                      text: CHARACTER_DRAWER_FULLY_LINKED_REASON,
                    },
                  ],
                },
              ]
      }
      actions={
        <CatalogPickerSelectionActions
          phase={phase}
          canSelect={hasAvailableKind}
          addLabel={isSelected ? 'Selected' : 'Select'}
          onAdd={onSelect}
          onRemove={onClear}
        />
      }
    />
  )
}
