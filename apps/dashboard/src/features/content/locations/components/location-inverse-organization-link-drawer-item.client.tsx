'use client'

import type { Organization } from '@rpg/contracts'
import { getOrganizationKindLabel } from '@rpg/contracts'

import {
  CatalogPickerItemHeader,
  CatalogPickerSelectionActions,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

type LocationInverseOrganizationLinkDrawerItemProps = {
  organization: Organization
  isSelected: boolean
  hasAvailableKind: boolean
  fullyLinkedReason: string
  onSelect: () => void
  onClear: () => void
}

export function LocationInverseOrganizationLinkDrawerItem({
  organization,
  isSelected,
  hasAvailableKind,
  fullyLinkedReason,
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
                : fullyLinkedReason,
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
