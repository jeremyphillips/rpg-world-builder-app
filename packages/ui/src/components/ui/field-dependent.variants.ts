import { cn } from '../../lib/utils'
import type { DependentChrome, DependentDependentsConfig } from '../../form/field-config'
import { DEFAULT_DEPENDENT_INSET } from '../../form/field-config'
import { resolveDependentInsetClasses, type FieldRhythm } from './field.variants'
import { resolveFieldRailClasses, type FieldRailTone } from './field-rail.variants'
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
export {
  resolveFieldRailClasses,
  fieldRailOffsetClasses,
  type FieldRailTone,
} from './field-rail.variants'

/** Where dependent chrome applies on toggle-dependent sections. */
export type FieldDependentsScope = 'wrapper' | 'arrayItems'

/** @deprecated Use {@link FieldRailTone}. */
export type FieldGroupRailTone = FieldRailTone

/** Border/bg panel around dependent fields with optional padding shell. */
export function resolveFieldDependentsChromeClasses(options: FieldContainerChromeOptions): string {
  return cn('rounded-md border p-3', resolveFieldContainerChromeClasses(options))
}

/** @deprecated Use {@link resolveFieldRailClasses}. */
export function resolveDependentRailChromeClasses(
  _rhythm: FieldRhythm = 'comfortable',
  tone: FieldRailTone = 'border',
): string {
  return resolveFieldRailClasses(tone)
}

export type ResolvedDependentPresentation = {
  inset: boolean
  insetClassName: string
  chrome: DependentChrome
  /** Decorative rail wrapper — does not add content indentation. */
  railClassName?: string
  /** Panel/chrome shell — owns its own internal padding. */
  chromeWrapperClassName?: string
  arrayItemSurface?: FieldContainerChromeOptions['surface']
  arrayItemTone?: FieldContainerChromeOptions['tone']
}

/** Resolves dependent inset (content position) and chrome (decoration) independently. */
export function resolveDependentPresentation(
  dependents: DependentDependentsConfig & { inset: boolean },
  rhythm: FieldRhythm,
): ResolvedDependentPresentation {
  const { inset, chrome = 'none' } = dependents
  const insetClassName = resolveDependentInsetClasses(inset, rhythm)

  if (chrome === 'none') {
    return { inset, insetClassName, chrome }
  }

  if (chrome === 'panel') {
    const surface = dependents.panel?.surface
    const tone = dependents.panel?.tone
    return {
      inset,
      insetClassName,
      chrome,
      chromeWrapperClassName: resolveFieldDependentsChromeClasses({ surface, tone }),
      arrayItemSurface: surface,
      arrayItemTone: tone,
    }
  }

  return {
    inset,
    insetClassName,
    chrome,
    railClassName: resolveFieldRailClasses(),
  }
}

/** @deprecated Use {@link resolveDependentPresentation}. */
export type ResolvedDependentChromePresentation = ResolvedDependentPresentation

/** @deprecated Use {@link resolveDependentPresentation}. */
export function resolveDependentChromePresentation(
  dependents: DependentDependentsConfig,
  rhythm: FieldRhythm,
): ResolvedDependentPresentation {
  return resolveDependentPresentation(
    { ...dependents, inset: dependents.inset ?? DEFAULT_DEPENDENT_INSET },
    rhythm,
  )
}
