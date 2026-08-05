'use client'

import * as React from 'react'

import type { Location, TerritorialAuthorityKind } from '@rpg/contracts'
import { CatalogPickerSheet, SelectField, Text } from '@rpg/ui'

import { CATALOG_PICKER_COMMIT_SUCCESS_MS, catalogPickerShellProps } from '@/features/character'
import {
  CatalogPickerItemHeader,
  CatalogPickerSelectionActions,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'
import { useLocations } from '@/features/content/locations/hooks/use-locations'
import {
  buildTerritorialAuthorityAddActionLabel,
  buildTerritorialAuthorityKindOptions,
  TERRITORIAL_AUTHORITY_KIND_LABEL,
  TERRITORIAL_AUTHORITY_KIND_PLACEHOLDER,
  TERRITORIAL_AUTHORITY_SEARCH_DISABLED_PLACEHOLDER,
} from '@/features/content/locations/lib/territorial-authority.lib'

import {
  buildTerritorialAuthorityInverseRegionSearchText,
  ORGANIZATION_TERRITORIAL_INVERSE_CHOOSE_KIND_MESSAGE,
  ORGANIZATION_TERRITORIAL_INVERSE_DRAWER_TITLE,
  ORGANIZATION_TERRITORIAL_INVERSE_REGION_SEARCH_PLACEHOLDER,
} from '../lib/organization-territorial-authority-inverse.lib'

export type OrganizationTerritorialAuthorityPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  authorityKind: TerritorialAuthorityKind | null
  onAuthorityKindChange: (authorityKind: TerritorialAuthorityKind) => void
  onSelectRegion: (regionId: string) => void
}

const NO_RESULTS_MESSAGE = 'No matches for this search.'
const NO_ITEMS_MESSAGE = 'No regions are available.'

function RegionPickerItemHeader({
  region,
  authorityKind,
  flashRegionIds,
  onSelectRegion,
  onFlash,
}: {
  region: Location
  authorityKind: TerritorialAuthorityKind | null
  flashRegionIds: ReadonlySet<string>
  onSelectRegion: (regionId: string) => void
  onFlash: (regionId: string) => void
}) {
  if (!authorityKind) return null

  const isSuccess = flashRegionIds.has(region.id)
  const phase = resolveCatalogPickerRowActionPhase({ isSuccess, isSelected: false })
  const addActionLabel = buildTerritorialAuthorityAddActionLabel(authorityKind)

  return (
    <CatalogPickerItemHeader
      name={region.name}
      metadataLines={[
        {
          segments: [{ type: 'text', text: region.slug }],
        },
      ]}
      actions={
        <CatalogPickerSelectionActions
          phase={phase}
          canSelect={Boolean(authorityKind)}
          addLabel={addActionLabel}
          onAdd={() => {
            if (!authorityKind) return
            onSelectRegion(region.id)
            onFlash(region.id)
          }}
          onRemove={() => undefined}
        />
      }
    />
  )
}

function useRegionSuccessFlashes(clearWhen: string) {
  const [flashRegionIds, setFlashRegionIds] = React.useState<ReadonlySet<string>>(() => new Set())
  const [trackedClearWhen, setTrackedClearWhen] = React.useState(clearWhen)

  if (clearWhen !== trackedClearWhen) {
    setTrackedClearWhen(clearWhen)
    setFlashRegionIds(new Set())
  }

  const triggerFlash = React.useCallback((regionId: string) => {
    setFlashRegionIds((current) => new Set(current).add(regionId))
    window.setTimeout(() => {
      setFlashRegionIds((current) => {
        if (!current.has(regionId)) return current
        const next = new Set(current)
        next.delete(regionId)
        return next
      })
    }, CATALOG_PICKER_COMMIT_SUCCESS_MS)
  }, [])

  return { flashRegionIds, triggerFlash }
}

export function OrganizationTerritorialAuthorityPickerDrawer({
  open,
  onOpenChange,
  campaignId,
  authorityKind,
  onAuthorityKindChange,
  onSelectRegion,
}: OrganizationTerritorialAuthorityPickerDrawerProps) {
  const { data: locations = [] } = useLocations(campaignId)
  const kindOptions = React.useMemo(() => buildTerritorialAuthorityKindOptions('region'), [])
  const regions = React.useMemo(
    () => (authorityKind ? locations.filter((location) => location.kind === 'region') : []),
    [authorityKind, locations],
  )
  const { flashRegionIds, triggerFlash } = useRegionSuccessFlashes(authorityKind ?? 'none')

  const searchDisabled = !authorityKind
  const searchPlaceholder = authorityKind
    ? ORGANIZATION_TERRITORIAL_INVERSE_REGION_SEARCH_PLACEHOLDER
    : TERRITORIAL_AUTHORITY_SEARCH_DISABLED_PLACEHOLDER

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={ORGANIZATION_TERRITORIAL_INVERSE_DRAWER_TITLE}
      {...catalogPickerShellProps()}
      headerBelowDescription={
        <SelectField
          id="organization-territorial-authority-kind"
          label={TERRITORIAL_AUTHORITY_KIND_LABEL}
          value={authorityKind ?? ''}
          placeholder={TERRITORIAL_AUTHORITY_KIND_PLACEHOLDER}
          options={kindOptions}
          onValueChange={(value) => onAuthorityKindChange(value as TerritorialAuthorityKind)}
        />
      }
      searchDisabled={searchDisabled}
      searchPlaceholder={searchPlaceholder}
      emptyState={
        authorityKind ? undefined : (
          <Text variant="muted" className="text-sm" role="status">
            {ORGANIZATION_TERRITORIAL_INVERSE_CHOOSE_KIND_MESSAGE}
          </Text>
        )
      }
      items={regions}
      getItemKey={(region: Location) => region.id}
      getItemToolbarLabel={(region: Location) => region.name}
      getSearchText={(region: Location) =>
        buildTerritorialAuthorityInverseRegionSearchText({
          name: region.name,
          slug: region.slug,
        })
      }
      noResultsMessage={NO_RESULTS_MESSAGE}
      noItemsMessage={NO_ITEMS_MESSAGE}
      renderItemHeader={(region: Location) => (
        <RegionPickerItemHeader
          region={region}
          authorityKind={authorityKind}
          flashRegionIds={flashRegionIds}
          onSelectRegion={onSelectRegion}
          onFlash={triggerFlash}
        />
      )}
    />
  )
}
