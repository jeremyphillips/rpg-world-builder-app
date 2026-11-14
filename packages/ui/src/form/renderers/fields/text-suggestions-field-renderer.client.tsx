'use client'

import { useController, useFormState } from 'react-hook-form'

import { TextSuggestionsField } from '../../../components/ui/text-suggestions-field.client'
import { useDependsOnValues } from '../../config/form-depends-on.client'
import { useFieldErrorPresentation } from '../../context/array-item-presentation.context'
import { resolveNestedFieldErrorMessage } from '../../errors/resolve-field-error-message'
import {
  fieldDefaultValue,
  resolveFieldHintPresentation,
  type TextSuggestionsFieldConfig,
} from '../../field-config'
import { assertOptionalDisclosureFieldConfig } from '../../config/optional-disclosure-config.lib'
import { useFieldControlSize } from '../../context/form-section.context'
import { buildFieldShellProps } from '../field-shell-props.lib'
import type { ResolvedFieldRender } from '../field-resolved-render.types'
import { OptionalDisclosureTextSuggestionsFieldRenderer } from './optional-disclosure/optional-disclosure-field-renderer.client'

export function TextSuggestionsFieldRenderer({ resolved }: { resolved: ResolvedFieldRender }) {
  const config = resolved.config as TextSuggestionsFieldConfig
  const suggestions = resolved.resolvedSuggestions ?? []

  if (config.optionalDisclosure) {
    assertOptionalDisclosureFieldConfig(config)
    return (
      <OptionalDisclosureTextSuggestionsFieldRenderer
        config={config}
        disclosure={config.optionalDisclosure}
        suggestions={suggestions}
        fullName={resolved.fullName}
        id={resolved.id}
        namePrefix={resolved.namePrefix}
      />
    )
  }

  return <BoundTextSuggestionsField resolved={resolved} suggestions={suggestions} />
}

function BoundTextSuggestionsField({
  resolved,
  suggestions,
}: {
  resolved: ResolvedFieldRender
  suggestions: readonly string[]
}) {
  const config = resolved.config as TextSuggestionsFieldConfig
  const hintDependsOn =
    typeof config.hint === 'object' && config.hint?.resolve ? config.hint.resolve.dependsOn : []
  const hintValues = useDependsOnValues(hintDependsOn, resolved.namePrefix)
  const hintPresentation = resolveFieldHintPresentation(config, hintValues)
  const controlSize = useFieldControlSize(config.controlSizeOverride)

  const { field, fieldState } = useController({
    name: resolved.fullName,
    defaultValue: fieldDefaultValue(resolved.authored),
  })
  const { errors } = useFormState()
  const validation = useFieldErrorPresentation(
    fieldState.error?.message ?? resolveNestedFieldErrorMessage(errors, resolved.fullName),
    resolved.fullName,
  )

  return (
    <TextSuggestionsField
      {...buildFieldShellProps(
        {
          config,
          id: resolved.id,
          hint: hintPresentation.text,
          hintPosition: hintPresentation.position,
          presentationSize: resolved.presentationSize,
          controlSize,
        },
        validation,
        { sizes: 'none', label: 'visible' },
      )}
      suggestions={suggestions}
      placeholder={config.placeholder}
      size={controlSize}
      value={field.value ?? fieldDefaultValue(config)}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  )
}
