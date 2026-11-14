import type { FieldSize } from '../components/ui/field.client'
import { resolveFormDensity, type FormDensity } from './form-density'

/** Resolves leaf control scale from presentation density, section default, and field override. */
export function resolveFieldControlSize(options: {
  density: FormDensity
  defaultControlSize?: FieldSize | undefined
  override?: FieldSize | undefined
}): FieldSize {
  return options.override ?? options.defaultControlSize ?? resolveFormDensity(options.density).size
}
