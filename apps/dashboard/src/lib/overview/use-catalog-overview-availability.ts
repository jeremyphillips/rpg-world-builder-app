import { useMemo } from 'react'

import { buildCatalogOverviewAvailabilityChrome } from './catalog-overview-availability.lib'
import { buildOverviewAvailabilitySupplement } from './overview-availability-supplement'

export function useCatalogOverviewAvailability<
  T extends { id: string },
  TFilters extends Record<string, unknown>,
>(input: Parameters<typeof buildCatalogOverviewAvailabilityChrome<T, TFilters>>[0]) {
  const chrome = useMemo(
    () => buildCatalogOverviewAvailabilityChrome(input),
    [input.data, input.filterSchema, input.filterState, input.onFilterChange],
  )

  const resultSupplement = useMemo(() => {
    if (!chrome.scope || !chrome.onFilterChange || !chrome.field.availabilityConfig) {
      return null
    }

    return buildOverviewAvailabilitySupplement({
      scope: chrome.scope,
      campaignAvailability: chrome.campaignAvailability,
      campaignAvailabilityFilterId: chrome.field.campaignAvailabilityFilterId,
      actions: {
        setFilterValue: (id, value, options) => chrome.onFilterChange!(id, value, options),
      },
    })
  }, [chrome])

  return {
    scope: chrome.scope,
    campaignAvailability: chrome.campaignAvailability,
    campaignAvailabilityFilterId: chrome.field.campaignAvailabilityFilterId,
    resultSupplement,
    shouldUseAvailabilityEmptyState: chrome.shouldUseAvailabilityEmptyState,
  }
}
