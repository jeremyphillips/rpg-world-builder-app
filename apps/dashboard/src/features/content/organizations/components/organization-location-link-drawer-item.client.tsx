'use client'

import type { Location } from '@rpg/contracts'
import { getLocationKindLabel } from '@rpg/contracts'

import {
  CatalogPickerItemHeader,
  CatalogPickerSelectionActions,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { LOCATION_CONNECTION_ALREADY_LINKED_REASON } from '../../lib/location-connection-kind-options'

type OrganizationLocationLinkDrawerItemProps = {
  location: Location
  isSelected: boolean
  hasAvailableKind: boolean
  onSelect: () => void
  onClear: () => void
}

export function OrganizationLocationLinkDrawerItem({
  location,
  isSelected,
  hasAvailableKind,
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
              text: hasAvailableKind
                ? getLocationKindLabel(location.kind)
                : LOCATION_CONNECTION_ALREADY_LINKED_REASON,
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
