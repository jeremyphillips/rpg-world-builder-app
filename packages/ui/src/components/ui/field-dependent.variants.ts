import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import type {
  DependentChrome,
  DependentDependentsConfig,
} from '../../form/field-config/form-item.types'
import { DEFAULT_DEPENDENT_CHROME } from '../../form/field-config/form-item.types'
import type { FieldConfig } from '../../form/field-config'
import {
  DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS,
  DEPENDENT_NEST_BLOCK_CLASS,
  DEPENDENT_NEST_HOST_CLASS,
  DEPENDENT_NEST_RHYTHM_CLASS,
} from './field-dependent-alignment.constants'
import {
  resolveControllerDependentAnatomy,
  resolveDependentNestAlignmentClass,
} from '../../form/presentation/resolve-controller-dependent-anatomy.lib'
import type { FieldRhythm } from './field.variants'
import { borderStrength } from './border-strength'

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
  DEPENDENT_NEST_BLOCK_CLASS,
  DEPENDENT_NEST_HOST_CLASS,
  DEPENDENT_NEST_RHYTHM_CLASS,
} from './field-dependent-alignment.constants'
export {
  DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS,
  DEPENDENT_NEST_ALIGN_INLINE_CHECKBOX_CLASS,
  DEPENDENT_NEST_ALIGN_INLINE_SWITCH_CLASS,
} from './field-dependent-alignment.constants'

/** Internal form nesting plane — not author-facing. */
export type FormSurfaceHost = 'field-container' | 'array-item'

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

/** Default dependent nest host — block, rail border, alignment, rhythm, fill. */
export function resolveDependentNestClasses(options: {
  rhythm: FieldRhythm
  surfaceHost: FormSurfaceHost
  alignmentClassName?: string
}): string {
  const alignmentClassName = options.alignmentClassName ?? DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS
  return cn(
    DEPENDENT_NEST_BLOCK_CLASS,
    borderStrength('subtle'),
    alignmentClassName,
    DEPENDENT_NEST_RHYTHM_CLASS[options.rhythm],
    DEPENDENT_NEST_HOST_CLASS[options.surfaceHost],
  )
}

export type ResolvedDependentPresentation = {
  chrome: DependentChrome
  /** When true, renders the default dependent nest (rail + fill + inset). */
  showNest: boolean
  /** BEM classes for the nest host (`ui-field-dependent-nest` + modifiers). */
  nestClassName?: string
}

/** Resolves default dependent nest vs flush opt-out. */
export function resolveDependentPresentation(
  dependents: Pick<DependentDependentsConfig, 'chrome'>,
  rhythm: FieldRhythm,
  options?: { surfaceHost?: FormSurfaceHost; controller?: FieldConfig },
): ResolvedDependentPresentation {
  const { chrome = DEFAULT_DEPENDENT_CHROME } = dependents
  const surfaceHost = options?.surfaceHost ?? 'field-container'
  const controller = options?.controller
  const alignmentClassName = controller
    ? resolveDependentNestAlignmentClass(resolveControllerDependentAnatomy(controller))
    : DEPENDENT_NEST_ALIGN_FIELD_EDGE_CLASS

  if (chrome === 'none') {
    return { chrome, showNest: false }
  }

  return {
    chrome,
    showNest: true,
    nestClassName: resolveDependentNestClasses({
      rhythm,
      surfaceHost,
      alignmentClassName,
    }),
  }
}
