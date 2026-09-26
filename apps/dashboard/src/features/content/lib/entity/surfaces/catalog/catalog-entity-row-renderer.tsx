import type { ReactNode } from 'react'
import type { CatalogPickerCollapsibleRowRenderArgs } from '@rpg/ui'

import type { EntityAnatomyTrailing } from '../../anatomy/entity-anatomy-trailing.types'
import type { EntitySummaryModel } from '../../summary/entity-summary.types'
import { projectEntitySurfaceConfig } from '../entity-surface-projection.lib'
import type { EntitySurfaceConfig } from '../entity-surface.types'
import { CatalogEntityRow } from './catalog-entity-row'

type CatalogEntityRowRendererConfig<TItem> = {
  buildSurface?: (item: TItem) => EntitySurfaceConfig
  buildEntity?: (item: TItem) => EntitySummaryModel
  buildTrailing?: (item: TItem) => EntityAnatomyTrailing | undefined
  buildHeadingHref?: (item: TItem) => string | undefined
  buildDetails?: (item: TItem) => ReactNode
}

function resolveCatalogEntityRowModel<TItem>(
  item: TItem,
  projected: ReturnType<typeof projectEntitySurfaceConfig> | undefined,
  buildEntity: CatalogEntityRowRendererConfig<TItem>['buildEntity'],
): EntitySummaryModel {
  if (projected?.entity) return projected.entity
  const entity = buildEntity?.(item)
  if (!entity) {
    throw new Error('Catalog entity row requires buildSurface or buildEntity')
  }
  return entity
}

function resolveCatalogEntityRowDetails<TItem>(
  item: TItem,
  args: CatalogPickerCollapsibleRowRenderArgs<TItem>,
  projected: ReturnType<typeof projectEntitySurfaceConfig> | undefined,
  buildDetails: CatalogEntityRowRendererConfig<TItem>['buildDetails'],
): ReactNode {
  if (projected?.details) return projected.details
  return buildDetails?.(item) ?? args.details ?? null
}

function resolveCatalogEntityRowTrailing<TItem>(
  item: TItem,
  projected: ReturnType<typeof projectEntitySurfaceConfig> | undefined,
  buildTrailing: CatalogEntityRowRendererConfig<TItem>['buildTrailing'],
): EntityAnatomyTrailing | undefined {
  return projected?.trailing ?? buildTrailing?.(item)
}

function renderCatalogEntityRow<TItem>(
  args: CatalogPickerCollapsibleRowRenderArgs<TItem>,
  config: CatalogEntityRowRendererConfig<TItem>,
) {
  const surfaceConfig = config.buildSurface?.(args.item)
  const projected = surfaceConfig ? projectEntitySurfaceConfig(surfaceConfig) : undefined

  return (
    <CatalogEntityRow
      toolbarLabel={args.toolbarLabel}
      domIds={args.domIds}
      collapsible={args.collapsible}
      collapsed={args.collapsed}
      onToggleCollapse={args.onToggleCollapse}
      summary={args.summary}
      details={resolveCatalogEntityRowDetails(args.item, args, projected, config.buildDetails)}
      entity={resolveCatalogEntityRowModel(args.item, projected, config.buildEntity)}
      trailing={resolveCatalogEntityRowTrailing(args.item, projected, config.buildTrailing)}
      headingHref={config.buildHeadingHref?.(args.item)}
    />
  )
}

export function createCatalogEntityRowRenderer<TItem>(
  config: CatalogEntityRowRendererConfig<TItem>,
) {
  return (args: CatalogPickerCollapsibleRowRenderArgs<TItem>) =>
    renderCatalogEntityRow(args, config)
}
