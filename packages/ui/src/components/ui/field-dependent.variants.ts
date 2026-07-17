import { cn } from '../../lib/utils'
import {
  resolveFieldContainerChromeClasses,
  type FieldContainerChromeOptions,
} from './field-surface.variants'

export type {
  FieldContainerChromeOptions,
  FieldGroupOutlineTone,
  FieldGroupPanelTone,
  FieldStatusTone,
  FieldSurfaceVariant,
} from './field-surface.variants'
export {
  FIELD_STATUS_TONES,
  FIELD_SURFACE_VARIANTS,
  fieldGroupBodyShellLayoutClasses,
  isCompactLabelTone,
  isFieldStatusTone,
  isFieldSurfaceVariant,
  resolveFieldContainerChromeClasses,
  resolveFieldGroupOutlineToneClasses,
  resolveFieldGroupPanelToneClasses,
} from './field-surface.variants'

/** Where dependent chrome applies on toggle-dependent sections. */
export type FieldDependentsScope = 'wrapper' | 'arrayItems'

/** Border/bg inset around dependent fields with optional padding shell. */
export function resolveFieldDependentsChromeClasses(options: FieldContainerChromeOptions): string {
  return cn('rounded-md border p-3', resolveFieldContainerChromeClasses(options))
}
