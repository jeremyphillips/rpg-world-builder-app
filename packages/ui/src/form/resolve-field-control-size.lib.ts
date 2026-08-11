import type { FieldSize } from '../components/ui/field.client'
import { resolveFormDensity, type FormDensity } from './form-density'

/** Resolves leaf control scale from section density and an optional override. */
export function resolveFieldControlSize(options: {
  density: FormDensity
  override?: FieldSize | undefined
}): FieldSize {
  return options.override ?? resolveFormDensity(options.density).size
}
