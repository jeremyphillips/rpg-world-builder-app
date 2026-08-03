'use client'

import { useController, useFormState } from 'react-hook-form'

import { TextSuggestionsField } from '../../../components/ui/text-suggestions-field.client'
import { pickFieldChromeProps } from '../../../components/ui/field-chrome.variants'
import { useDependsOnValues } from '../../config/form-depends-on.client'
import { useFieldErrorPresentation } from '../../context/array-item-presentation.context'
import { resolveNestedFieldErrorMessage } from '../../errors/resolve-field-error-message'
import {
  fieldDefaultValue,
  resolveFieldHintPresentation,
  type TextSuggestionsFieldConfig,
} from '../../field-config'
import { resolveInheritedFieldSize } from '../../../components/ui/field.variants'
import { useFormSectionContext } from '../../context/form-section.context'

interface TextSuggestionsFieldRendererProps {
  config: TextSuggestionsFieldConfig
  fullName: string
  id: string
  namePrefix?: string
}

export function TextSuggestionsFieldRenderer({
  config,
  fullName,
  id,
  namePrefix,
}: TextSuggestionsFieldRendererProps) {
  const { size: inheritedSize } = useFormSectionContext()
  const suggestionValues = useDependsOnValues(config.suggestions.dependsOn, namePrefix)
  const hintDependsOn =
    typeof config.hint === 'object' && config.hint?.resolve ? config.hint.resolve.dependsOn : []
  const hintValues = useDependsOnValues(hintDependsOn, namePrefix)
  const suggestions = config.suggestions.suggestionsWhen(suggestionValues)
  const hintPresentation = resolveFieldHintPresentation(config, hintValues)
  const size = resolveInheritedFieldSize({ explicit: config.size, inherited: inheritedSize })

  const { field, fieldState } = useController({
    name: fullName,
    defaultValue: fieldDefaultValue(config),
  })
  const { errors } = useFormState()
  const validation = useFieldErrorPresentation(
    fieldState.error?.message ?? resolveNestedFieldErrorMessage(errors, fullName),
    fullName,
  )

  return (
    <TextSuggestionsField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      suggestions={suggestions}
      placeholder={config.placeholder}
      hint={hintPresentation.text}
      hintPosition={hintPresentation.position}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={size}
      width={config.width}
      value={field.value ?? fieldDefaultValue(config)}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
      {...validation}
    />
  )
}
