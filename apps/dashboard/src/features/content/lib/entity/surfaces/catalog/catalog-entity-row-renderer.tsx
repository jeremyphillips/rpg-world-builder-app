import type { ReactNode } from 'react'
import type { CatalogPickerCollapsibleRowRenderArgs } from '@rpg/ui'

import { CatalogEntityRow } from './catalog-entity-row'
import type { EntityAnatomyTrailing } from '../../anatomy/entity-anatomy-trailing.types'
import type { EntitySummaryModel } from '../../summary/entity-summary.types'

export function createCatalogEntityRowRenderer<TItem>({
  buildEntity,
  buildTrailing,
  buildHeadingHref,
  buildDetails,
}: {
  buildEntity: (item: TItem) => EntitySummaryModel
  buildTrailing: (item: TItem) => EntityAnatomyTrailing | undefined
  buildHeadingHref?: (item: TItem) => string | undefined
  buildDetails?: (item: TItem) => ReactNode
}) {
  return (args: CatalogPickerCollapsibleRowRenderArgs<TItem>) => {
    const details = buildDetails?.(args.item) ?? args.details ?? null

    return (
      <CatalogEntityRow
        toolbarLabel={args.toolbarLabel}
        domIds={args.domIds}
        collapsible={args.collapsible}
        collapsed={args.collapsed}
        onToggleCollapse={args.onToggleCollapse}
        summary={args.summary}
        details={details}
        entity={buildEntity(args.item)}
        trailing={buildTrailing(args.item)}
        headingHref={buildHeadingHref?.(args.item)}
      />
    )
  }
}
