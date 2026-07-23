import { cn } from '../../lib/utils'
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
