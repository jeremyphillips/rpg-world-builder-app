import {
  collectProgressionTableBreakpoints,
  formatGeneralTableMetadata,
  type ContentTable,
} from '@rpg/contracts'

import { tableBuilderKindLabel } from '../../lib/table-builder/table-builder-kind-options.lib'
import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

export function formatFeatureTableMetadata(table: ContentTable): string {
  if (table.kind === 'general') {
    return formatGeneralTableMetadata(table)
  }

  const columnCount = table.columns.length
  const breakpointCount = collectProgressionTableBreakpoints(table).length
  const columnLabel = columnCount === 1 ? 'column' : 'columns'
  const breakpointLabel = breakpointCount === 1 ? 'breakpoint' : 'breakpoints'
  return `${columnCount} ${columnLabel} · ${breakpointCount} ${breakpointLabel}`
}

export function featureTableKindLabel(table: ContentTable): string {
  return tableBuilderKindLabel(table.kind)
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
