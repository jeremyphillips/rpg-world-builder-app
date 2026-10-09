import type { CatalogSortAxisDef, CatalogSortAxisId } from './catalog-sort.types'

/**
 * Greenfield default copy for directional catalog sort axes.
 * Single SSOT for menu labels, trigger labels, and group headings.
 */
export const CATALOG_SORT_AXES = {
  name: {
    label: 'Name',
    ascending: {
      value: 'name_asc',
      label: 'A–Z',
      triggerLabel: 'Name: A–Z',
    },
    descending: {
      value: 'name_desc',
      label: 'Z–A',
      triggerLabel: 'Name: Z–A',
    },
  },
  price: {
    label: 'Price',
    ascending: {
      value: 'price_asc',
      label: 'Low to high',
      triggerLabel: 'Price: Low',
    },
    descending: {
      value: 'price_desc',
      label: 'High to low',
      triggerLabel: 'Price: High',
    },
  },
  createdAt: {
    label: 'Date created',
    /** Newest first in the menu — presentation only; does not dictate storage field names. */
    directionOrder: ['descending', 'ascending'],
    ascending: {
      value: 'date_asc',
      label: 'Oldest first',
      triggerLabel: 'Date: Oldest',
    },
    descending: {
      value: 'date_desc',
      label: 'Newest first',
      triggerLabel: 'Date: Newest',
    },
  },
  level: {
    label: 'Level',
    ascending: {
      value: 'level_asc',
      label: 'Low to high',
      triggerLabel: 'Level: Low',
    },
    descending: {
      value: 'level_desc',
      label: 'High to low',
      triggerLabel: 'Level: High',
    },
  },
} as const satisfies Record<CatalogSortAxisId, CatalogSortAxisDef>

export type CatalogSortAxisKey = keyof typeof CATALOG_SORT_AXES
