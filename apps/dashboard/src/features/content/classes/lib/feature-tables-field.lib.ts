import {
  collectProgressionTableBreakpoints,
  GENERAL_TABLE_KIND_ENTRIES,
  PROGRESSION_TABLE_KIND_ENTRIES,
  type ContentTable,
} from '@rpg/contracts'

import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

export function formatFeatureTableMetadata(table: ContentTable): string {
  if (table.kind === 'general') {
    const columnCount = table.columns.length
    const rowCount = table.rows.length
    const columnLabel = columnCount === 1 ? 'column' : 'columns'
    const rowLabel = rowCount === 1 ? 'row' : 'rows'
    return `${columnCount} ${columnLabel} · ${rowCount} ${rowLabel}`
  }

  const columnCount = table.columns.length
  const breakpointCount = collectProgressionTableBreakpoints(table).length
  const columnLabel = columnCount === 1 ? 'column' : 'columns'
  const breakpointLabel = breakpointCount === 1 ? 'breakpoint' : 'breakpoints'
  return `${columnCount} ${columnLabel} · ${breakpointCount} ${breakpointLabel}`
}

export function featureTableKindLabel(table: ContentTable): string {
  if (table.kind === 'general') {
    return GENERAL_TABLE_KIND_ENTRIES.general.label
  }
  return PROGRESSION_TABLE_KIND_ENTRIES[table.kind].label
}

export function buildFeatureTableAllowedLevels(
  featureLevel: number | string | undefined,
  formCtx: ContentFormCtx,
): number[] {
  const min =
    typeof featureLevel === 'number'
      ? featureLevel
      : typeof featureLevel === 'string'
        ? Number(featureLevel)
        : Number.NaN
  const max = effectiveMaxFromCtx(formCtx)

  if (!Number.isFinite(min) || min < 1 || max < min) return []

  return Array.from({ length: max - min + 1 }, (_, index) => min + index)
}
