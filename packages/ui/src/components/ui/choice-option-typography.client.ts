'use client'

import { useFieldControlSize } from '../../form/context/form-section.context'
import { useOptionalResolvedFieldControlSize } from './field.client'
import { fieldSizeToOptionTypographyScale, type CheckboxOptionScale } from './checkbox-option.lib'
import { choiceOptionLabelClassName } from './choice-option-typography.lib'

export function useChoiceOptionTypographyScale(
  explicitScale?: CheckboxOptionScale,
): CheckboxOptionScale {
  const formSize = useFieldControlSize()
  const fieldControlSize = useOptionalResolvedFieldControlSize()
  if (explicitScale) {
    return explicitScale
  }
  return fieldSizeToOptionTypographyScale(fieldControlSize ?? formSize)
}

export function useChoiceOptionLabelClassName(
  explicitScale?: CheckboxOptionScale,
  className?: string,
): string {
  return choiceOptionLabelClassName(useChoiceOptionTypographyScale(explicitScale), className)
}
