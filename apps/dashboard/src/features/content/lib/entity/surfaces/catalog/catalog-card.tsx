import type { ReactNode } from 'react'
import {
  CollapsibleListItem,
  SelectionTarget,
  SelectionTargetRadio,
  useRadioGroupItemSelected,
} from '@rpg/ui'

import { EntityAnatomyHost } from '../../anatomy/entity-anatomy'
import type { EntityAnatomyTrailing } from '../../anatomy/entity-anatomy-trailing.types'
import { resolveEntitySurfaceEdges } from '../../anatomy/entity-surface-edges.lib'
import type { EntitySummaryModel } from '../../summary/entity-summary.types'
import { EntityCardContent } from '../cards/content/entity-card-content'
import { EntityCardFrame } from '../cards/content/entity-card-frame'
import { DisclosureEntityCardHeader } from '../cards/disclosure/disclosure-entity-card-header'
import { disclosureEntityCardListItemVariants } from '../cards/disclosure/entity-card-disclosure-renderer.variants'
import { catalogCardBodyWashVariants } from './catalog-card.variants'

type CatalogCardBaseProps = {
  toolbarLabel: string
  domIds: { itemId: string; titleId: string; bodyId: string }
  collapsible?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  summary?: ReactNode
  details?: ReactNode
  entity: EntitySummaryModel
}

export type CatalogCardProps = CatalogCardBaseProps &
  (
    | { selection?: undefined; trailing?: EntityAnatomyTrailing }
    | { selection: { value: string; disabled?: boolean }; trailing?: never }
  )

const CATALOG_CARD_DENSITY = 'compact' as const

function CatalogCardSelectionBody({
  toolbarLabel,
  domIds,
  summary,
  entity,
  selection,
}: {
  toolbarLabel: string
  domIds: CatalogCardBaseProps['domIds']
  summary?: ReactNode
  entity: EntitySummaryModel
  selection: { value: string; disabled?: boolean }
}) {
  const disabled = selection.disabled ?? false
  const selected = useRadioGroupItemSelected(selection.value)
  const radioId = `${domIds.itemId}-radio`

  return (
    <EntityCardFrame
      density={CATALOG_CARD_DENSITY}
      interactive={!disabled}
      selected={selected}
      disabled={disabled}
      edges={resolveEntitySurfaceEdges({ leadingUtilityCount: 1 })}
      leadingUtilityCount={1}
    >
      <SelectionTarget htmlFor={radioId}>
        <EntityCardContent>
          <EntityAnatomyHost
            entity={entity}
            density={CATALOG_CARD_DENSITY}
            leading={{
              kind: 'selection',
              content: (
                <SelectionTargetRadio
                  id={radioId}
                  value={selection.value}
                  disabled={disabled}
                  aria-label={toolbarLabel}
                  aria-describedby={domIds.titleId}
                />
              ),
            }}
          />
        </EntityCardContent>
      </SelectionTarget>
      {summary}
    </EntityCardFrame>
  )
}

function CatalogCardFlatBody({
  entity,
  trailing,
  summary,
}: {
  entity: EntitySummaryModel
  trailing?: EntityAnatomyTrailing
  summary?: ReactNode
}) {
  return (
    <EntityCardFrame
      density={CATALOG_CARD_DENSITY}
      edges={resolveEntitySurfaceEdges({ leadingUtilityCount: 0, trailing })}
      leadingUtilityCount={0}
    >
      <EntityCardContent>
        <EntityAnatomyHost entity={entity} trailing={trailing} density={CATALOG_CARD_DENSITY} />
      </EntityCardContent>
      {summary}
    </EntityCardFrame>
  )
}

/**
 * Disclosure catalog rows stay on CollapsibleListItem — not EntityCard disclosure.
 * Body wash, domIds, and picker summary stacking differ from EntityCardDisclosureRenderer;
 * keep this shell catalog-local rather than a shared cross-surface composer.
 */
function CatalogCardDisclosureBody({
  toolbarLabel,
  domIds,
  collapsed,
  onToggleCollapse,
  summary,
  details,
  entity,
  trailing,
}: {
  toolbarLabel: string
  domIds: CatalogCardBaseProps['domIds']
  collapsed?: boolean
  onToggleCollapse?: () => void
  summary?: ReactNode
  details?: ReactNode
  entity: EntitySummaryModel
  trailing?: EntityAnatomyTrailing
}) {
  const leadingUtilityCount = 1

  return (
    <EntityCardFrame
      density={CATALOG_CARD_DENSITY}
      edges={resolveEntitySurfaceEdges({ leadingUtilityCount, trailing })}
      leadingUtilityCount={leadingUtilityCount}
    >
      <CollapsibleListItem
        itemId={domIds.itemId}
        titleId={domIds.titleId}
        bodyId={domIds.bodyId}
        toolbarAriaLabel={toolbarLabel}
        rowLayout="entity-card"
        density={CATALOG_CARD_DENSITY}
        toolbarCompact
        toolbarLeadingChrome="none"
        collapsible
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        showDragHandle={false}
        className={disclosureEntityCardListItemVariants()}
        bodyClassName={catalogCardBodyWashVariants()}
        header={
          <EntityCardContent>
            <DisclosureEntityCardHeader
              entity={entity}
              trailing={trailing}
              density={CATALOG_CARD_DENSITY}
            />
          </EntityCardContent>
        }
        summary={summary}
        body={details}
      />
    </EntityCardFrame>
  )
}

/** Entity-aware catalog browse card — EntityCardFrame owns perimeter; EntityCardContent owns inset. */
export function CatalogCard(props: CatalogCardProps) {
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
      <CatalogCardSelectionBody
        toolbarLabel={toolbarLabel}
        domIds={domIds}
        summary={summary}
        entity={entity}
        selection={props.selection}
      />
    )
  }

  const trailing = 'trailing' in props ? props.trailing : undefined

  if (!collapsible) {
    return <CatalogCardFlatBody entity={entity} trailing={trailing} summary={summary} />
  }

  return (
    <CatalogCardDisclosureBody
      toolbarLabel={toolbarLabel}
      domIds={domIds}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      summary={summary}
      details={details}
      entity={entity}
      trailing={trailing}
    />
  )
}
