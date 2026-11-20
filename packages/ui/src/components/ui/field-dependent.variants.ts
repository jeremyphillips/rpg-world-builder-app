import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import type {
  DependentChrome,
  DependentDependentsConfig,
} from '../../form/field-config/form-item.types'
import { DEFAULT_DEPENDENT_CHROME } from '../../form/field-config/form-item.types'
import type { FieldConfig } from '../../form/field-config'
import { DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS } from './field-dependent-alignment.constants'
import {
  resolveControllerDependentAnatomy,
  resolveDependentNestAlignmentClass,
} from '../../form/presentation/resolve-controller-dependent-anatomy.lib'
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
  DEFAULT_FLAT_NO_HEADER_ARRAY_ITEM_SURFACE,
  DEFAULT_DEPENDENT_SURFACE,
  DEFAULT_PANEL_SURFACE,
  fieldGroupBodyShellLayoutClasses,
  resolveFieldContainerChromeClasses,
  resolveOutlineBorderClasses,
  resolveSurfaceClasses,
  SEMANTIC_SURFACE_TONES,
} from './field-surface.variants'
export {
  resolveFieldRailClasses,
  resolveDependentNestRailClasses,
  type FieldRailTone,
} from './field-rail.variants'

/** @deprecated Use {@link FieldDependentsScope}. */
export type FieldDependentsScope = 'wrapper' | 'arrayItems'

/** Internal form nesting plane — not author-facing. */
export type FormSurfaceHost = 'field-container' | 'array-item'

export type FieldGroupRailTone = FieldRailTone

export {
  DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS,
  DEPENDENT_NEST_ALIGN_INLINE_CHECKBOX_CLASS,
  DEPENDENT_NEST_ALIGN_INLINE_SWITCH_CLASS,
} from './field-dependent-alignment.constants'

/** @deprecated Use {@link DEPENDENT_NEST_ALIGN_INLINE_SWITCH_CLASS} and field-dependent.css calc. */
export const dependentNestMarginClasses = 'ml-11'

/**
 * Nest inner padding — no block-start pad; parent-child gap is owned by
 * {@link dependentSectionStackVariants}.
 */
export const dependentNestPaddingClasses = 'pt-3 pr-3 pb-3 pl-4'

/** Vertical gap between controller and dependents region — rhythm-aware (compact 4px / comfortable 8px). */
export const dependentSectionStackVariants = cva('flex flex-col', {
  variants: {
    rhythm: {
      compact: 'gap-1',
      comfortable: 'gap-2',
    },
  },
  defaultVariants: {
    rhythm: 'comfortable',
  },
})

export function resolveDependentSectionStackClasses(rhythm: FieldRhythm = 'comfortable'): string {
  return dependentSectionStackVariants({ rhythm })
}

/** @deprecated Use {@link resolveDependentSectionStackClasses}. */
export const dependentSectionStackClasses = resolveDependentSectionStackClasses('comfortable')

/** @deprecated Panel chrome removed — retained for legacy call sites mapping to nest. */
export function resolveFieldDependentsChromeClasses(options: FieldContainerChromeOptions): string {
  return cn('rounded-md border p-3', resolveFieldContainerChromeClasses(options))
}

/** @deprecated Use {@link resolveDependentNestRailClasses}. */
export function resolveDependentRailChromeClasses(
  _rhythm: FieldRhythm = 'comfortable',
  tone: FieldRailTone = 'neutral',
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

/** Default dependent nest shell — alignment modifier, padding, host-aware fill. */
export function resolveDependentNestShellClasses(
  surfaceHost: FormSurfaceHost = 'field-container',
  alignmentClassName: string = DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS,
): string {
  return cn(
    alignmentClassName,
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
  /** Nest shell — alignment, padding, host-aware fill. */
  nestShellClassName?: string
}

/** Resolves default dependent nest vs flush opt-out. */
export function resolveDependentPresentation(
  dependents: Pick<DependentDependentsConfig, 'chrome' | 'inset'>,
  _rhythm: FieldRhythm,
  options?: { surfaceHost?: FormSurfaceHost; controller?: FieldConfig },
): ResolvedDependentPresentation {
  let { chrome = DEFAULT_DEPENDENT_CHROME } = dependents
  const surfaceHost = options?.surfaceHost ?? 'field-container'
  const controller = options?.controller
  const alignmentClassName = controller
    ? resolveDependentNestAlignmentClass(resolveControllerDependentAnatomy(controller))
    : DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS

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
    nestShellClassName: resolveDependentNestShellClasses(surfaceHost, alignmentClassName),
  }
}

/** @deprecated Use {@link resolveDependentPresentation}. */
export type ResolvedDependentChromePresentation = ResolvedDependentPresentation

/** @deprecated Use {@link resolveDependentPresentation}. */
export function resolveDependentChromePresentation(
  dependents: DependentDependentsConfig,
  rhythm: FieldRhythm,
  options?: { surfaceHost?: FormSurfaceHost; controller?: FieldConfig },
): ResolvedDependentPresentation {
  return resolveDependentPresentation(dependents, rhythm, options)
}
