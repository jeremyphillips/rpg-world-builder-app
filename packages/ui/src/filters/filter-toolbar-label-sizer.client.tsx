'use client'

import type { ReactNode } from 'react'

export const FILTER_TOOLBAR_SIZER_LABEL_ATTR = 'data-filter-toolbar-sizer-label'

type FilterToolbarLabelSizerProps = {
  labels: readonly string[]
  children: ReactNode
}

/** Reserves the widest label so a toolbar control does not change width with its value. */
export function FilterToolbarLabelSizer({ labels, children }: FilterToolbarLabelSizerProps) {
  return (
    <span className="ui-label-sizer">
      {labels.map((label) => (
        <span
          key={label}
          {...{ [FILTER_TOOLBAR_SIZER_LABEL_ATTR]: '' }}
          aria-hidden
          className="ui-label-sizer__ghost"
        >
          {label}
        </span>
      ))}
      <span className="ui-label-sizer__live">{children}</span>
    </span>
  )
}
