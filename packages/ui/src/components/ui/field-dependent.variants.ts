import { cn } from '../../lib/utils'
import type { DependentChrome, DependentDependentsConfig } from '../../form/field-config'
import { DEFAULT_DEPENDENT_CHROME } from '../../form/field-config'
import type { FieldRhythm } from './field.variants'
import {
  resolveDependentNestRailClasses,
  resolveFieldRailClasses,
  type FieldRailTone,
} from './field-rail.variants'
import { establishSurfaceCurrent } from './surface-current.lib'
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
  CANVAS_SURFACE,
  DEFAULT_ARRAY_ITEM_SURFACE,
  DEFAULT_FLAT_ARRAY_ITEM_SURFACE,
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
  resolveDependentNestRailClasses,
  fieldRailOffsetClasses,
  type FieldRailTone,
} from './field-rail.variants'

/** @deprecated Use {@link FieldDependentsScope}. */
export type FieldDependentsScope = 'wrapper' | 'arrayItems'

/** Internal form nesting plane — not author-facing. */
export type FormSurfaceHost = 'field-container' | 'array-item'

/** @deprecated Use {@link FieldRailTone}. */
export type FieldGroupRailTone = FieldRailTone

/** Nest horizontal offset from controller — 44px (`ml-11`). */
export const dependentNestMarginClasses = 'ml-11'

/** Nest inner padding — 12px top/right/bottom, 16px left (`pt-3 pr-3 pb-3 pl-4`). */
export const dependentNestPaddingClasses = 'pt-3 pr-3 pb-3 pl-4'

/** Vertical gap between controller and dependents region — 16px (`gap-4`). */
export const dependentSectionStackClasses = 'flex flex-col gap-4'

/** @deprecated Panel chrome removed — retained for legacy call sites mapping to nest. */
export function resolveFieldDependentsChromeClasses(options: FieldContainerChromeOptions): string {
  return cn('rounded-md border p-3', resolveFieldContainerChromeClasses(options))
}

/** @deprecated Use {@link resolveDependentNestRailClasses}. */
export function resolveDependentRailChromeClasses(
  _rhythm: FieldRhythm = 'comfortable',
  tone: FieldRailTone = 'border',
): string {
  return resolveFieldRailClasses(tone)
}

/** Host-aware wash for default dependent nests — no border or extra radius. */
export function resolveDependentNestFillClasses(
  surfaceHost: FormSurfaceHost = 'field-container',
): string {
  if (surfaceHost === 'array-item') {
    return cn('bg-surface-faint', establishSurfaceCurrent('surface-faint'))
  }

  return cn('bg-background', establishSurfaceCurrent('background'))
}

/** Default dependent nest shell — margin, padding, and host-aware fill only. */
export function resolveDependentNestShellClasses(
  surfaceHost: FormSurfaceHost = 'field-container',
): string {
  return cn(
    dependentNestMarginClasses,
    dependentNestPaddingClasses,
    resolveDependentNestFillClasses(surfaceHost),
  )
}

export type ResolvedDependentPresentation = {
  chrome: DependentChrome
  /** When true, renders the default dependent nest (rail + fill + inset). */
  showNest: boolean
  /** Decorative rail on the nest wrapper. */
  railClassName?: string
  /** Nest shell — margin, padding, host-aware fill. */
  nestShellClassName?: string
}

/** Resolves default dependent nest vs flush opt-out. */
export function resolveDependentPresentation(
  dependents: Pick<DependentDependentsConfig, 'chrome' | 'inset'>,
  _rhythm: FieldRhythm,
  options?: { surfaceHost?: FormSurfaceHost },
): ResolvedDependentPresentation {
  let { chrome = DEFAULT_DEPENDENT_CHROME } = dependents
  const surfaceHost = options?.surfaceHost ?? 'field-container'

  if (dependents.inset === false) {
    chrome = 'none'
  }

  if (chrome === 'none') {
    return { chrome, showNest: false }
  }

  return {
    chrome,
    showNest: true,
    railClassName: resolveDependentNestRailClasses(),
    nestShellClassName: resolveDependentNestShellClasses(surfaceHost),
  }
}

/** @deprecated Use {@link resolveDependentPresentation}. */
export type ResolvedDependentChromePresentation = ResolvedDependentPresentation

/** @deprecated Use {@link resolveDependentPresentation}. */
export function resolveDependentChromePresentation(
  dependents: DependentDependentsConfig,
  rhythm: FieldRhythm,
  options?: { surfaceHost?: FormSurfaceHost },
): ResolvedDependentPresentation {
  return resolveDependentPresentation(dependents, rhythm, options)
}
