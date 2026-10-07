'use client'

import type { ReactNode } from 'react'

import { filterFieldLabelVariants } from './filter-bar.variants'
import { useFilterChrome } from './filter-chrome.context'
import type { FilterDensity } from './filter-schema.types'

type FilterFieldCaptionShared = {
  children: ReactNode
  /** Overrides inherited filter chrome. Omitted density follows `useFilterChrome()`. */
  density?: FilterDensity
  id?: string
}

type FilterFieldCaptionSpanProps = FilterFieldCaptionShared & {
  as?: 'span'
}

type FilterFieldCaptionLabelProps = FilterFieldCaptionShared & {
  as: 'label'
  htmlFor: string
}

export type FilterFieldCaptionProps = FilterFieldCaptionSpanProps | FilterFieldCaptionLabelProps

/**
 * Filter toolbar caption. Typography comes only from `filterFieldLabelVariants`.
 * This is not a form field label: no `font-field-label`, required marker, or help chrome.
 */
export function FilterFieldCaption(props: FilterFieldCaptionProps) {
  const chrome = useFilterChrome()
  const density = props.density ?? chrome.density
  const className = filterFieldLabelVariants({ density })

  if (props.as === 'label') {
    return (
      <label id={props.id} htmlFor={props.htmlFor} className={className}>
        {props.children}
      </label>
    )
  }

  return (
    <span id={props.id} className={className}>
      {props.children}
    </span>
  )
}
