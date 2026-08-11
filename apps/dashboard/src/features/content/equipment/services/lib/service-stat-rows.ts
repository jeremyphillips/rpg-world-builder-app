import {
  formatServiceDuration,
  getServiceCategoryLabel,
  type ServiceEquipment,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../../lib/detail/metadata/content-stat-rows'

/** Stat rows for service equipment detail (excludes kind and cost). */
export function getServiceStatRows(item: ServiceEquipment): ContentStatRowData[] {
  return [
    { label: 'Category', value: getServiceCategoryLabel(item.serviceCategory) },
    ...(item.duration ? [{ label: 'Duration', value: formatServiceDuration(item.duration) }] : []),
    ...(item.notes ? [{ label: 'Notes', value: item.notes }] : []),
  ]
}
