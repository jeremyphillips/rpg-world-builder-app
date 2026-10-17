import type { ReactNode } from 'react'
import {
  CollapsibleListItemDisclosureTrigger,
  CollapsibleListItemDragHandleTrigger,
  type CollapsibleListItemDragHandleConfig,
} from '@rpg/ui'

export function resolveEntityDisclosureLeadingUtilities({
  dragHandleProps,
}: {
  dragHandleProps?: CollapsibleListItemDragHandleConfig
}): ReactNode[] {
  const showDragHandle = Boolean(dragHandleProps)

  return [
    showDragHandle ? <CollapsibleListItemDragHandleTrigger /> : null,
    <CollapsibleListItemDisclosureTrigger key="disclosure-trigger" />,
  ].filter((utility) => utility != null) as ReactNode[]
}
