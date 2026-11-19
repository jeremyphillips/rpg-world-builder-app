import type { FilterDensity } from '../../filters/filter-schema.types'
import type { FieldSize } from './field.client'
import { resolveCheckboxOptionScale, type CheckboxOptionScale } from './checkbox-option.lib'

type CheckboxOptionShellPropsInput = {
  shell?: 'outlined'
  size?: CheckboxOptionScale
  filterDensity?: FilterDensity
  formSize: FieldSize
  toolbarAlign?: boolean
  tone: string
  isChecked: boolean
  disabled?: boolean
  invalid?: boolean
}

export function resolveCheckboxOptionShellProps({
  shell,
  size,
  filterDensity,
  formSize,
  toolbarAlign,
  tone,
  isChecked,
  disabled,
  invalid,
}: CheckboxOptionShellPropsInput) {
  const outlined = shell === 'outlined'
  const resolved = resolveCheckboxOptionScale({
    explicitSize: size,
    filterDensity: outlined ? filterDensity : undefined,
    formSize,
  })

  return {
    'data-shell': outlined ? ('outlined' as const) : undefined,
    'data-choice-tone': tone,
    'data-checked': isChecked ? ('true' as const) : ('false' as const),
    'data-disabled': disabled ? ('true' as const) : undefined,
    'data-invalid': invalid ? ('true' as const) : undefined,
    'data-size': outlined ? resolved.explicit : undefined,
    'data-field-scale': outlined ? resolved.scale : undefined,
    'data-field-align': toolbarAlign ? ('' as const) : undefined,
  }
}
