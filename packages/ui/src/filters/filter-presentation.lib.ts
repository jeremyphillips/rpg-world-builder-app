import { fieldWidthVariants } from '../components/ui/field-control.variants'
import { cn } from '../lib/utils'
import type { FilterChromeContextValue } from './filter-chrome.context'
import {
  filterBarControlVariants,
  filterFieldLabelVariants,
  filterInlineFieldGroupVariants,
  filterStackedFieldGroupVariants,
  FILTER_DENSITY_DEFAULT,
} from './filter-bar.variants'
import { resolveFilterSelectFieldLayout } from './filter-select-field-chrome.client'
import type { FilterFieldDef, FilterFieldWidth } from './filter-schema.types'
import type { FilterDensity } from './filter-schema.types'

export type FilterFieldPresentation =
  | {
      type: 'text'
      labelClassName: string
      groupClassName: string
      controlSize: 'sm' | 'md'
    }
  | {
      type: 'select'
      labelClassName: string
      groupClassName: string
      controlSize: 'sm' | 'md'
    }
  | {
      type: 'boolean'
      labelClassName: string
      groupClassName: string
    }
  | {
      type: 'chips'
      labelClassName: string
      groupClassName: string
      chipSize: 'sm' | 'md'
      shellClassName: string
    }
  | {
      type: 'popover'
      labelClassName: string
      groupClassName: string
      triggerSize: 'sm' | 'md'
    }

type FilterPresentationField = Pick<FilterFieldDef<unknown, Record<string, unknown>>, 'type'> & {
  layout?: 'stacked' | 'inline'
  width?: FilterFieldWidth
}

function resolveGroupClassName(field: FilterPresentationField, density: FilterDensity): string {
  if (field.type === 'select') {
    const layout = resolveFilterSelectFieldLayout(field)
    if (layout === 'inline') {
      return filterInlineFieldGroupVariants({ density })
    }
    if (layout === 'stacked') {
      return filterStackedFieldGroupVariants({ density })
    }
    return filterBarControlVariants({ type: 'select' })
  }

  if (field.type === 'text') {
    return filterBarControlVariants({ type: 'text' })
  }

  if (field.type === 'boolean') {
    return filterBarControlVariants({ type: 'boolean' })
  }

  if (field.type === 'chips') {
    return filterBarControlVariants({ type: 'chips' })
  }

  return filterBarControlVariants({ type: 'popover' })
}

export function resolveFilterControlSize(
  density: FilterDensity = FILTER_DENSITY_DEFAULT,
): 'sm' | 'md' {
  return density === 'compact' ? 'sm' : 'md'
}

export function resolveFilterChipSize(
  density: FilterDensity = FILTER_DENSITY_DEFAULT,
): 'sm' | 'md' {
  return resolveFilterControlSize(density)
}

export function resolveFilterFieldPresentation(
  field: FilterPresentationField,
  chrome: FilterChromeContextValue,
): FilterFieldPresentation {
  const { density } = chrome
  const labelClassName = filterFieldLabelVariants({ density })
  const groupClassName = resolveGroupClassName(field, density)

  if (field.type === 'text') {
    return {
      type: 'text',
      labelClassName,
      groupClassName,
      controlSize: resolveFilterControlSize(density),
    }
  }

  if (field.type === 'select') {
    return {
      type: 'select',
      labelClassName,
      groupClassName,
      controlSize: resolveFilterControlSize(density),
    }
  }

  if (field.type === 'boolean') {
    return {
      type: 'boolean',
      labelClassName,
      groupClassName,
    }
  }

  if (field.type === 'chips') {
    return {
      type: 'chips',
      labelClassName,
      groupClassName,
      chipSize: resolveFilterChipSize(density),
      shellClassName: density === 'compact' ? 'gap-1' : 'gap-2',
    }
  }

  return {
    type: 'popover',
    labelClassName,
    groupClassName,
    triggerSize: resolveFilterControlSize(density),
  }
}

export function resolveFilterFieldWidthClasses(width?: FilterFieldWidth): string | undefined {
  if (!width) return undefined
  return cn(fieldWidthVariants({ width }))
}
