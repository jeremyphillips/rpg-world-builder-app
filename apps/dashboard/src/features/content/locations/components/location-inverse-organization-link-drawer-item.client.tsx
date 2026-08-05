'use client'

import type { Organization } from '@rpg/contracts'
import { getOrganizationKindLabel } from '@rpg/contracts'

import {
  CatalogPickerItemHeader,
  CatalogPickerSelectionActions,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { LOCATION_CONNECTION_ALREADY_LINKED_REASON } from '../../lib/location-connection-kind-options'

type LocationInverseOrganizationLinkDrawerItemProps = {
  organization: Organization
  isSelected: boolean
  hasAvailableKind: boolean
  onSelect: () => void
  onClear: () => void
}

export function LocationInverseOrganizationLinkDrawerItem({
  organization,
  isSelected,
  hasAvailableKind,
  onSelect,
  onClear,
}: LocationInverseOrganizationLinkDrawerItemProps) {
  const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

  return (
    <CatalogPickerItemHeader
      name={organization.name}
      metadataLines={[
        {
          segments: [
            {
              type: 'text',
              text: hasAvailableKind
                ? getOrganizationKindLabel(organization.organizationKind)
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
