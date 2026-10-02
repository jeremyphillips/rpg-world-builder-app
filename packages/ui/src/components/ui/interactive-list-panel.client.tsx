'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { comboboxContentVariants } from './combobox-field.variants'
import {
  InteractiveListGroupHeading,
  type InteractiveListGroupHeadingProps,
} from './interactive-list-group-heading.client'
import { InteractiveList } from './interactive-list.client'
import { InteractiveListViewport } from './interactive-list-viewport.client'

export type InteractiveListPanelProps = {
  children: React.ReactNode
  /** Visual group label — hosts own menu/listbox section semantics. */
  groupHeading?: React.ReactNode
  groupHeadingProps?: Omit<InteractiveListGroupHeadingProps, 'children'>
  listProps?: Omit<React.ComponentPropsWithRef<typeof InteractiveList>, 'children'>
  className?: string
  /** When set, wraps children in combobox-style panel width chrome (for popover content bodies). */
  panelWidth?: 'fit' | 'match'
}

/** Neutral scroll body — compositions set `listbox` or `menu` roles on the list. */
export function InteractiveListPanel({
  children,
  groupHeading,
  groupHeadingProps,
  listProps,
  className,
  panelWidth,
}: InteractiveListPanelProps) {
  const list = (
    <>
      {groupHeading != null ? (
        <InteractiveListGroupHeading {...groupHeadingProps}>
          {groupHeading}
        </InteractiveListGroupHeading>
      ) : null}
      <InteractiveListViewport>
        <InteractiveList {...listProps}>{children}</InteractiveList>
      </InteractiveListViewport>
    </>
  )

  if (panelWidth == null) {
    return <div className={className}>{list}</div>
  }

  return (
    <div className={cn(comboboxContentVariants({ triggerWidth: panelWidth }), className)}>
      {list}
    </div>
  )
}
