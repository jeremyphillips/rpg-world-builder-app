import { fieldWidthVariants } from '../components/ui/field-control.variants'
import type { FieldLabelLayout } from '../components/ui/field-row-presentation.lib'
import { resolveFieldPresentation } from '../components/ui/field-row-presentation.lib'
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

export type FilterChromePresentation = {
  labelClassName: string
  controlSize: 'sm' | 'md'
}

export function resolveFilterChromePresentation(
  chrome: FilterChromeContextValue,
): FilterChromePresentation {
  const { density } = chrome
  return {
    labelClassName: filterFieldLabelVariants({ density }),
    controlSize: resolveFilterControlSize(density),
  }
}

type FilterPresentationShared = {
  labelClassName: string
  groupClassName: string
  controlBandClassName: string
  alignmentAnchorClassName: string
}

export type FilterFieldPresentation =
  | (FilterPresentationShared & {
      type: 'text'
      controlSize: 'sm' | 'md'
    })
  | (FilterPresentationShared & {
      type: 'select'
      controlSize: 'sm' | 'md'
    })
  | (FilterPresentationShared & {
      type: 'boolean'
    })
  | (FilterPresentationShared & {
      type: 'chips'
      chipSize: 'sm' | 'md'
      shellClassName: string
    })
  | (FilterPresentationShared & {
      type: 'popover'
      triggerSize: 'sm' | 'md'
    })

type FilterPresentationField = Pick<FilterFieldDef<unknown, Record<string, unknown>>, 'type'> & {
  layout?: 'stacked' | 'inline'
  width?: FilterFieldWidth
}

/**
 * Maps filter field `layout` to shared {@link FieldLabelLayout}.
 * Schema API stays `stacked` | `inline` | default (omitted → hidden for non-selects;
 * selects resolve via {@link resolveFilterSelectFieldLayout}).
 */
export function mapFilterLayoutToLabelLayout(field: FilterPresentationField): FieldLabelLayout {
  if (field.type === 'boolean') return 'inline'
  if (field.type === 'select') {
    const layout = resolveFilterSelectFieldLayout(field)
    if (layout === 'inline') return 'inline'
    if (layout === 'stacked') return 'stacked'
    return 'hidden'
  }
  if (field.type === 'text' || field.type === 'chips' || field.type === 'popover') {
    return 'hidden'
  }
  return 'hidden'
}

function resolveFilterGroupExtras(field: FilterPresentationField, density: FilterDensity): string {
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
  const controlSize = resolveFilterControlSize(density)
  const labelLayout = mapFilterLayoutToLabelLayout(field)
  const controlBand =
    field.type === 'chips' || field.type === 'popover' ? 'content-sized' : 'single-line'

  const base = resolveFieldPresentation({
    size: controlSize,
    labelLayout,
    controlBand,
  })

  const labelClassName = filterFieldLabelVariants({ density })
  // Filter density variants own group layout; shared presentation owns band + anchor.
  const groupClassName = resolveFilterGroupExtras(field, density)
  const shared: FilterPresentationShared = {
    labelClassName,
    groupClassName,
    controlBandClassName: base.controlBandClassName,
    alignmentAnchorClassName: base.alignmentAnchorClassName,
  }

  if (field.type === 'text') {
    return {
      type: 'text',
      ...shared,
      controlSize,
    }
  }

  if (field.type === 'select') {
    return {
      type: 'select',
      ...shared,
      controlSize,
    }
  }

  if (field.type === 'boolean') {
    return {
      type: 'boolean',
      ...shared,
    }
  }

  if (field.type === 'chips') {
    return {
      type: 'chips',
      ...shared,
      chipSize: resolveFilterChipSize(density),
      shellClassName: density === 'compact' ? 'gap-1' : 'gap-2',
    }
  }

  return {
    type: 'popover',
    ...shared,
    triggerSize: controlSize,
  }
}

export function resolveFilterFieldWidthClasses(width?: FilterFieldWidth): string | undefined {
  if (!width) return undefined
  return cn(fieldWidthVariants({ width }))
}
