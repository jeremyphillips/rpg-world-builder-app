import {
  collapsibleListItemDisclosureShellPaddingClasses,
  collapsibleListItemFlatShellPaddingClasses,
  type CollapsibleListItemRowLayout,
  type CollapsibleListItemShellPreset,
} from './collapsible-list-item.variants'
import type { CollapsibleListItemActionsAlign } from './collapsible-list-item-shell.client'

export function resolveCollapsibleListItemShellLayout({
  layout,
  actionsAlign,
  rowLayout,
}: {
  layout: 'default' | 'compactRow'
  actionsAlign: CollapsibleListItemActionsAlign
  rowLayout: CollapsibleListItemRowLayout
}): 'default' | 'compactRow' | 'headerActions' | 'entityCardHeaderActions' {
  if (layout === 'compactRow') {
    return 'compactRow'
  }
  if (actionsAlign !== 'center') {
    return 'default'
  }
  return rowLayout === 'entity-card' ? 'entityCardHeaderActions' : 'headerActions'
}

export function resolveCollapsibleListItemHeaderActionsPaddingClasses(
  shellLayout: ReturnType<typeof resolveCollapsibleListItemShellLayout>,
  collapsible: boolean,
  preset: CollapsibleListItemShellPreset,
): string | undefined {
  if (shellLayout !== 'headerActions') return undefined
  if (collapsible || preset === 'catalog') {
    return collapsibleListItemDisclosureShellPaddingClasses
  }
  return collapsibleListItemFlatShellPaddingClasses
}
