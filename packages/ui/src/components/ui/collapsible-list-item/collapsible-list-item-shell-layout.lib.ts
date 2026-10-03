import {
  collapsibleListItemDisclosureShellPaddingClasses,
  collapsibleListItemFlatShellPaddingClasses,
  type CollapsibleListItemRowLayout,
  type CollapsibleListItemShellPreset,
} from './collapsible-list-item.variants'
import type { CollapsibleListItemHeaderActionsPlacement } from './collapsible-list-item-root.lib'

export function resolveCollapsibleListItemShellLayout({
  layout,
  headerActionsPlacement,
  rowLayout,
}: {
  layout: 'default' | 'compactRow'
  headerActionsPlacement: CollapsibleListItemHeaderActionsPlacement
  rowLayout: CollapsibleListItemRowLayout
}): 'default' | 'compactRow' | 'headerActions' | 'entityCardHeaderActions' {
  if (layout === 'compactRow') {
    return 'compactRow'
  }
  if (headerActionsPlacement !== 'center') {
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
