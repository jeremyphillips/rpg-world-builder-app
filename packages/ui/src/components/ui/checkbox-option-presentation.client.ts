'use client'

import { useFieldControlSize } from '../../form/context/form-section.context'
import { useOptionalFilterChrome } from '../../filters/filter-chrome.context'
import { useOptionalResolvedFieldControlSize } from './field.client'
import type { CheckboxOptionScale } from './checkbox-option.lib'
import { resolveCheckboxOptionScale } from './checkbox-option.lib'
import { resolveCheckboxOptionShellProps } from './checkbox-option-shell-props.lib'
import type { ChoiceTone } from './choice-control.styles'

type UseCheckboxOptionPresentationInput = {
  shell?: 'outlined'
  size?: CheckboxOptionScale
  toolbarAlign?: boolean
  tone: ChoiceTone
  isChecked: boolean
  disabled?: boolean
  invalid?: boolean
}

export function useCheckboxOptionPresentation({
  shell,
  size,
  toolbarAlign,
  tone,
  isChecked,
  disabled,
  invalid,
}: UseCheckboxOptionPresentationInput) {
  const formSize = useFieldControlSize()
  const fieldControlSize = useOptionalResolvedFieldControlSize()
  const controlSize = fieldControlSize ?? formSize
  const filterChrome = useOptionalFilterChrome()
  const outlined = shell === 'outlined'
  const filterDensity = outlined ? filterChrome?.density : undefined

  const resolvedScale = resolveCheckboxOptionScale({
    explicitSize: size,
    filterDensity,
    formSize: controlSize,
  }).scale

  const shellProps = resolveCheckboxOptionShellProps({
    shell,
    size,
    filterDensity,
    formSize: controlSize,
    toolbarAlign,
    tone,
    isChecked,
    disabled,
    invalid,
  })

  return { controlSize, resolvedScale, shellProps }
}
