'use client'

import type { Location } from '@rpg/contracts'
import { getLocationKindLabel } from '@rpg/contracts'

import {
  CatalogPickerItemHeader,
  CatalogPickerSelectionActions,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

type OrganizationLocationLinkDrawerItemProps = {
  location: Location
  isSelected: boolean
  hasAvailableKind: boolean
  fullyLinkedReason: string
  onSelect: () => void
  onClear: () => void
}

export function OrganizationLocationLinkDrawerItem({
  location,
  isSelected,
  hasAvailableKind,
  fullyLinkedReason,
  onSelect,
  onClear,
}: OrganizationLocationLinkDrawerItemProps) {
  const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

  return (
    <CatalogPickerItemHeader
      name={location.name}
      metadataLines={[
        {
          segments: [
            {
              type: 'text',
              text: hasAvailableKind ? getLocationKindLabel(location.kind) : fullyLinkedReason,
            },
          ],
        },
      ]}
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
