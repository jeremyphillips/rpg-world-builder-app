import { cn } from '../../lib/utils'
import {
  resolveFieldContainerChromeClasses,
  type FieldContainerChromeOptions,
} from './field-surface.variants'

export type {
  FieldContainerChromeOptions,
  FieldGroupOutlineTone,
  FieldStatusTone,
  SemanticSurfaceTone,
  SurfaceChromeConfig,
} from './field-surface.variants'
export {
  DEFAULT_ARRAY_ITEM_SURFACE,
  DEFAULT_DEPENDENT_SURFACE,
  DEFAULT_PANEL_SURFACE,
  FIELD_STATUS_TONES,
  fieldGroupBodyShellLayoutClasses,
  isCompactLabelTone,
  isFieldStatusTone,
  resolveFieldContainerChromeClasses,
  resolveFieldGroupOutlineToneClasses,
  resolveOutlineBorderClasses,
  resolveSurfaceClasses,
} from './field-surface.variants'

/** Where dependent chrome applies on toggle-dependent sections. */
export type FieldDependentsScope = 'wrapper' | 'arrayItems'

/** Border/bg inset around dependent fields with optional padding shell. */
export function resolveFieldDependentsChromeClasses(options: FieldContainerChromeOptions): string {
  return cn('rounded-md border p-3', resolveFieldContainerChromeClasses(options))
}
