'use client'

import type { CatalogPickerCollapsibleRowRenderArgs } from '@rpg/ui'

import { CatalogEntityDisclosureRow } from './catalog-entity-disclosure-row.client'
import type { EntityItemTrailing } from './entity-item-trailing.types'
import type { EntitySummaryModel } from './entity-summary.types'

export function createCatalogEntityDisclosureRowRenderer<TItem>({
  buildEntity,
  buildTrailing,
  buildHeadingHref,
}: {
  buildEntity: (item: TItem) => EntitySummaryModel
  buildTrailing: (item: TItem) => EntityItemTrailing | undefined
  buildHeadingHref?: (item: TItem) => string | undefined
}) {
  return (args: CatalogPickerCollapsibleRowRenderArgs<TItem>) => (
    <CatalogEntityDisclosureRow
      toolbarLabel={args.toolbarLabel}
      domIds={args.domIds}
      collapsible={args.collapsible}
      collapsed={args.collapsed}
      onToggleCollapse={args.onToggleCollapse}
      summary={args.summary}
      details={args.details}
      entity={buildEntity(args.item)}
      trailing={buildTrailing(args.item)}
      headingHref={buildHeadingHref?.(args.item)}
    />
  )
}
