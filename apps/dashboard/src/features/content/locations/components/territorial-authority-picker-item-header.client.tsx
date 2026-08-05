'use client'

import {
  getOrganizationKindLabel,
  type Organization,
  type TerritorialAuthorityKind,
} from '@rpg/contracts'

import {
  CatalogPickerItemHeader,
  CatalogPickerSelectionActions,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { buildTerritorialAuthorityAddActionLabel } from '../lib/territorial-authority.lib'

type TerritorialAuthorityPickerItemHeaderProps = {
  organization: Organization
  authorityKind: TerritorialAuthorityKind | null
  flashOrganizationIds: ReadonlySet<string>
  onSelectOrganization: (organizationId: string) => void
  onFlash: (organizationId: string) => void
}

export function TerritorialAuthorityPickerItemHeader({
  organization,
  authorityKind,
  flashOrganizationIds,
  onSelectOrganization,
  onFlash,
}: TerritorialAuthorityPickerItemHeaderProps) {
  if (!authorityKind) return null

  const isSuccess = flashOrganizationIds.has(organization.id)
  const phase = resolveCatalogPickerRowActionPhase({ isSuccess, isSelected: false })
  const addActionLabel = buildTerritorialAuthorityAddActionLabel(authorityKind)

  return (
    <CatalogPickerItemHeader
      name={organization.name}
      metadataLines={[
        {
          segments: [
            {
              type: 'text',
              text: getOrganizationKindLabel(organization.organizationKind),
            },
          ],
        },
      ]}
      actions={
        <CatalogPickerSelectionActions
          phase={phase}
          canSelect={Boolean(authorityKind)}
          addLabel={addActionLabel}
          onAdd={() => {
            if (!authorityKind) return
            onSelectOrganization(organization.id)
            onFlash(organization.id)
          }}
          onRemove={() => undefined}
        />
      }
    />
  )
}
