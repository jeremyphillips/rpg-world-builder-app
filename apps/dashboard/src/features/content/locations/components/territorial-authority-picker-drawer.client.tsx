'use client'

import * as React from 'react'

import type { Organization, TerritorialAuthorityKind } from '@rpg/contracts'
import { getOrganizationKindLabel } from '@rpg/contracts'
import { CatalogPickerSheet, SelectField, Text } from '@rpg/ui'

import { CATALOG_PICKER_COMMIT_SUCCESS_MS, catalogPickerShellProps } from '@/features/character'

import {
  buildTerritorialAuthoritySearchText,
  TERRITORIAL_AUTHORITY_CHOOSE_KIND_LIST_MESSAGE,
  TERRITORIAL_AUTHORITY_DRAWER_TITLE,
  TERRITORIAL_AUTHORITY_KIND_LABEL,
  TERRITORIAL_AUTHORITY_KIND_PLACEHOLDER,
  TERRITORIAL_AUTHORITY_SEARCH_DISABLED_PLACEHOLDER,
} from '../lib/territorial-authority.lib'
import type { LocationAuthoringType } from '../lib/location-authoring-type'
import { useTerritorialAuthorityPickerDrawer } from '../hooks/use-territorial-authority-picker-drawer.client'
import { TerritorialAuthorityPickerItemHeader } from './territorial-authority-picker-item-header.client'

export type TerritorialAuthorityPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  authoringType: LocationAuthoringType
  authorityKind: TerritorialAuthorityKind | null
  onAuthorityKindChange: (authorityKind: TerritorialAuthorityKind) => void
  onSelectOrganization: (organizationId: string) => void
}

const NO_RESULTS_MESSAGE = 'No matches for this search.'
const NO_ITEMS_MESSAGE = 'No organizations are available.'

function useTerritorialAuthoritySuccessFlashes(clearWhen: string) {
  const [flashOrganizationIds, setFlashOrganizationIds] = React.useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [trackedClearWhen, setTrackedClearWhen] = React.useState(clearWhen)

  if (clearWhen !== trackedClearWhen) {
    setTrackedClearWhen(clearWhen)
    setFlashOrganizationIds(new Set())
  }

  const triggerFlash = React.useCallback((organizationId: string) => {
    setFlashOrganizationIds((current) => new Set(current).add(organizationId))
    window.setTimeout(() => {
      setFlashOrganizationIds((current) => {
        if (!current.has(organizationId)) return current
        const next = new Set(current)
        next.delete(organizationId)
        return next
      })
    }, CATALOG_PICKER_COMMIT_SUCCESS_MS)
  }, [])

  return { flashOrganizationIds, triggerFlash }
}

export function TerritorialAuthorityPickerDrawer({
  open,
  onOpenChange,
  campaignId,
  authoringType,
  authorityKind,
  onAuthorityKindChange,
  onSelectOrganization,
}: TerritorialAuthorityPickerDrawerProps) {
  const picker = useTerritorialAuthorityPickerDrawer({
    open,
    campaignId,
    authoringType,
    authorityKind,
  })
  const { flashOrganizationIds, triggerFlash } = useTerritorialAuthoritySuccessFlashes(
    authorityKind ?? 'none',
  )

  const searchDisabled = !authorityKind
  const searchPlaceholder = authorityKind
    ? 'Search organizations'
    : TERRITORIAL_AUTHORITY_SEARCH_DISABLED_PLACEHOLDER

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={TERRITORIAL_AUTHORITY_DRAWER_TITLE}
      {...catalogPickerShellProps()}
      headerBelowDescription={
        <SelectField
          id="territorial-authority-kind"
          label={TERRITORIAL_AUTHORITY_KIND_LABEL}
          value={authorityKind ?? ''}
          placeholder={TERRITORIAL_AUTHORITY_KIND_PLACEHOLDER}
          options={picker.kindOptions}
          onValueChange={(value) => onAuthorityKindChange(value as TerritorialAuthorityKind)}
        />
      }
      searchDisabled={searchDisabled}
      searchPlaceholder={searchPlaceholder}
      emptyState={
        authorityKind ? undefined : (
          <Text variant="muted" className="text-sm" role="status">
            {TERRITORIAL_AUTHORITY_CHOOSE_KIND_LIST_MESSAGE}
          </Text>
        )
      }
      items={picker.items}
      getItemKey={(organization: Organization) => organization.id}
      getItemToolbarLabel={(organization: Organization) => organization.name}
      getSearchText={(organization: Organization) =>
        buildTerritorialAuthoritySearchText({
          name: organization.name,
          organizationKindLabel: getOrganizationKindLabel(organization.organizationKind),
        })
      }
      noResultsMessage={NO_RESULTS_MESSAGE}
      noItemsMessage={NO_ITEMS_MESSAGE}
      renderItemHeader={(organization: Organization) => (
        <TerritorialAuthorityPickerItemHeader
          organization={organization}
          authorityKind={authorityKind}
          flashOrganizationIds={flashOrganizationIds}
          onSelectOrganization={onSelectOrganization}
          onFlash={triggerFlash}
        />
      )}
    />
  )
}
