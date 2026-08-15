import { cn } from '../../lib/utils'
import type {
  DependentChrome,
  DependentDependentsConfig,
  DependentLayout,
} from '../../form/field-config'
import {
  fieldRailInnerPaddingClasses,
  fieldToggleDependentIndentClasses,
  type FieldRhythm,
} from './field.variants'
import {
  resolveFieldContainerChromeClasses,
  type FieldContainerChromeOptions,
} from './field-surface.variants'

export type {
  FieldContainerChromeOptions,
  SemanticSurfaceTone,
  SurfaceChromeConfig,
} from './field-surface.variants'
export {
  DEFAULT_ARRAY_ITEM_SURFACE,
  DEFAULT_DEPENDENT_SURFACE,
  DEFAULT_PANEL_SURFACE,
  fieldGroupBodyShellLayoutClasses,
  isCompactLabelTone,
  resolveFieldContainerChromeClasses,
  resolveOutlineBorderClasses,
  resolveSurfaceClasses,
  SEMANTIC_SURFACE_TONES,
} from './field-surface.variants'

/** Where dependent chrome applies on toggle-dependent sections. */
export type FieldDependentsScope = 'wrapper' | 'arrayItems'

export type FieldGroupRailTone = 'border' | 'primary'

const fieldDependentRailBodyVariants = {
  border: 'border-border',
  primary: 'border-primary',
} satisfies Record<FieldGroupRailTone, string>

/** Border/bg panel around dependent fields with optional padding shell. */
export function resolveFieldDependentsChromeClasses(options: FieldContainerChromeOptions): string {
  return cn('rounded-md border p-3', resolveFieldContainerChromeClasses(options))
}

/** Controller-relative outer offset for dependent regions. */
export function resolveDependentLayoutClasses(layout: DependentLayout = 'inset'): string {
  return layout === 'inset' ? fieldToggleDependentIndentClasses : ''
}

/** Left rail decoration — border + small local inner padding only. */
export function resolveDependentRailChromeClasses(tone: FieldGroupRailTone = 'border'): string {
  return cn('border-l-2', fieldDependentRailBodyVariants[tone], fieldRailInnerPaddingClasses)
}

export type ResolvedDependentPresentation = {
  layout: DependentLayout
  layoutClassName: string
  chrome: DependentChrome
  chromeWrapperClassName?: string
  arrayItemSurface?: FieldContainerChromeOptions['surface']
  arrayItemTone?: FieldContainerChromeOptions['tone']
}

/** Resolves dependent layout (positioning) and chrome (decoration) independently. */
export function resolveDependentPresentation(
  dependents: DependentDependentsConfig,
  rhythm: FieldRhythm,
): ResolvedDependentPresentation {
  void rhythm
  const layout = dependents.layout ?? 'inset'
  const chrome = dependents.chrome ?? 'none'
  const layoutClassName = resolveDependentLayoutClasses(layout)

  if (chrome === 'none') {
    return { layout, layoutClassName, chrome }
  }

  if (chrome === 'panel') {
    const surface = dependents.panel?.surface
    const tone = dependents.panel?.tone
    return {
      layout,
      layoutClassName,
      chrome,
      chromeWrapperClassName: resolveFieldDependentsChromeClasses({ surface, tone }),
      arrayItemSurface: surface,
      arrayItemTone: tone,
    }
  }

  return {
    layout,
    layoutClassName,
    chrome,
    chromeWrapperClassName: resolveDependentRailChromeClasses(),
  }
}

/** @deprecated Use {@link resolveDependentPresentation}. */
export type ResolvedDependentChromePresentation = ResolvedDependentPresentation

/** @deprecated Use {@link resolveDependentPresentation}. */
export function resolveDependentChromePresentation(
  dependents: DependentDependentsConfig,
  rhythm: FieldRhythm,
): ResolvedDependentPresentation {
  return resolveDependentPresentation(dependents, rhythm)
}
