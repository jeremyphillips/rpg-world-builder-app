import type { ReactNode } from 'react'
import {
  CollapsibleListItem,
  SelectionTarget,
  SelectionTargetRadio,
  useRadioGroupItemSelected,
} from '@rpg/ui'

import { EntityAnatomyHost } from '../../anatomy/entity-anatomy'
import { buildEntityContentOffsetStyle } from '../../anatomy/entity-leading-rail.lib'
import type { EntityAnatomyTrailing } from '../../anatomy/entity-anatomy-trailing.types'
import { resolveEntitySurfaceEdges } from '../../anatomy/entity-surface-edges.lib'
import type { EntitySummaryModel } from '../../summary/entity-summary.types'
import { EntityCardContent } from '../cards/content/entity-card-content'
import { EntityCardFrame } from '../cards/content/entity-card-frame'
import { DisclosureEntityCardHeader } from '../cards/disclosure/disclosure-entity-card-header'
import { disclosureEntityCardListItemVariants } from '../cards/disclosure/disclosure-entity-card.variants'
import { catalogEntityRowBodyWashVariants } from './catalog-entity-row.variants'

type CatalogEntityRowBaseProps = {
  toolbarLabel: string
  domIds: { itemId: string; titleId: string; bodyId: string }
  collapsible?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  summary?: ReactNode
  details?: ReactNode
  entity: EntitySummaryModel
}

export type CatalogEntityRowProps = CatalogEntityRowBaseProps &
  (
    | { selection?: undefined; trailing?: EntityAnatomyTrailing }
    | { selection: { value: string; disabled?: boolean }; trailing?: never }
  )

const CATALOG_ENTITY_ROW_DENSITY = 'compact' as const

function CatalogEntityRowSelectionBody({
  toolbarLabel,
  domIds,
  summary,
  entity,
  selection,
}: {
  toolbarLabel: string
  domIds: CatalogEntityRowBaseProps['domIds']
  summary?: ReactNode
  entity: EntitySummaryModel
  selection: { value: string; disabled?: boolean }
}) {
  const disabled = selection.disabled ?? false
  const selected = useRadioGroupItemSelected(selection.value)
  const radioId = `${domIds.itemId}-radio`

  return (
    <EntityCardFrame
      density={CATALOG_ENTITY_ROW_DENSITY}
      interactive={!disabled}
      selected={selected}
      disabled={disabled}
      edges={resolveEntitySurfaceEdges({ leadingUtilityCount: 1 })}
    >
      <SelectionTarget htmlFor={radioId}>
        <EntityCardContent>
          <EntityAnatomyHost
            entity={entity}
            density={CATALOG_ENTITY_ROW_DENSITY}
            leading={
              <SelectionTargetRadio
                id={radioId}
                value={selection.value}
                disabled={disabled}
                aria-label={toolbarLabel}
                aria-describedby={domIds.titleId}
              />
            }
          />
        </EntityCardContent>
      </SelectionTarget>
      {summary}
    </EntityCardFrame>
  )
}

/** Entity-aware catalog picker row — EntityCardFrame owns perimeter; EntityCardContent owns inset. */
export function CatalogEntityRow(props: CatalogEntityRowProps) {
  const {
    toolbarLabel,
    domIds,
    collapsible = false,
    collapsed,
    onToggleCollapse,
    summary,
    details,
    entity,
  } = props

  if (props.selection && !collapsible) {
    return (
      <CatalogEntityRowSelectionBody
        toolbarLabel={toolbarLabel}
        domIds={domIds}
        summary={summary}
        entity={entity}
        selection={props.selection}
      />
    )
  }

  const trailing = 'trailing' in props ? props.trailing : undefined
  const isDisclosure = collapsible
  const contentOffsetStyle = isDisclosure
    ? buildEntityContentOffsetStyle({
        count: 1,
        density: CATALOG_ENTITY_ROW_DENSITY,
      })
    : undefined

  return (
    <EntityCardFrame
      density={CATALOG_ENTITY_ROW_DENSITY}
      edges={resolveEntitySurfaceEdges({ leadingUtilityCount: isDisclosure ? 1 : 0, trailing })}
      style={contentOffsetStyle}
    >
      <CollapsibleListItem
        itemId={domIds.itemId}
        titleId={domIds.titleId}
        bodyId={domIds.bodyId}
        toolbarAriaLabel={toolbarLabel}
        rowLayout="entity-card"
        density={CATALOG_ENTITY_ROW_DENSITY}
        toolbarCompact
        toolbarLeadingChrome="none"
        collapsible={isDisclosure && collapsible}
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        showDragHandle={false}
        className={disclosureEntityCardListItemVariants()}
        bodyClassName={isDisclosure ? catalogEntityRowBodyWashVariants() : undefined}
        header={
          <EntityCardContent>
            {isDisclosure ? (
              <DisclosureEntityCardHeader
                entity={entity}
                trailing={trailing}
                density={CATALOG_ENTITY_ROW_DENSITY}
              />
            ) : (
              <EntityAnatomyHost
                entity={entity}
                trailing={trailing}
                density={CATALOG_ENTITY_ROW_DENSITY}
              />
            )}
          </EntityCardContent>
        }
        summary={summary}
        body={details}
      />
    </EntityCardFrame>
  )
}
