import { cn } from '../../lib/utils'
import type { DependentChrome, DependentDependentsConfig } from '../../form/field-config'
import { resolveFieldGroupChromeClassNames } from './field-group-chrome.variants'
import type { FieldRhythm } from './field.variants'
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

/** Border/bg inset around dependent fields with optional padding shell. */
export function resolveFieldDependentsChromeClasses(options: FieldContainerChromeOptions): string {
  return cn('rounded-md border p-3', resolveFieldContainerChromeClasses(options))
}

export type ResolvedDependentChromePresentation = {
  chrome: DependentChrome
  wrapperClassName?: string
  arrayItemSurface?: FieldContainerChromeOptions['surface']
  arrayItemTone?: FieldContainerChromeOptions['tone']
}

/** Resolves dependent chrome — defaults to inset. */
export function resolveDependentChromePresentation(
  dependents: DependentDependentsConfig,
  rhythm: FieldRhythm,
): ResolvedDependentChromePresentation {
  const chrome: DependentChrome = dependents.chrome ?? 'inset'

  if (chrome === 'none') {
    return { chrome }
  }

  if (chrome === 'panel') {
    const surface = dependents.panel?.surface
    const tone = dependents.panel?.tone
    return {
      chrome,
      wrapperClassName: resolveFieldDependentsChromeClasses({ surface, tone }),
      arrayItemSurface: surface,
      arrayItemTone: tone,
    }
  }

  return {
    chrome,
    wrapperClassName: resolveFieldGroupChromeClassNames({ variant: 'inset' }, { rhythm }).body,
  }
}
