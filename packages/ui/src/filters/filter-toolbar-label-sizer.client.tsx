'use client'

import type { ReactNode } from 'react'

import {
  filterToolbarLabelSizerClasses,
  filterToolbarLabelSizerGhostClasses,
  filterToolbarLabelSizerLiveClasses,
} from './filter-bar.variants'

export const FILTER_TOOLBAR_SIZER_LABEL_ATTR = 'data-filter-toolbar-sizer-label'

type FilterToolbarLabelSizerProps = {
  labels: readonly string[]
  children: ReactNode
}

/** Reserves the widest label so a toolbar control does not change width with its value. */
export function FilterToolbarLabelSizer({ labels, children }: FilterToolbarLabelSizerProps) {
  return (
    <span className={filterToolbarLabelSizerClasses}>
      {labels.map((label) => (
        <span
          key={label}
          {...{ [FILTER_TOOLBAR_SIZER_LABEL_ATTR]: '' }}
          aria-hidden
          className={filterToolbarLabelSizerGhostClasses}
        >
          {label}
        </span>
      ))}
      <span className={filterToolbarLabelSizerLiveClasses}>{children}</span>
    </span>
  )
}
