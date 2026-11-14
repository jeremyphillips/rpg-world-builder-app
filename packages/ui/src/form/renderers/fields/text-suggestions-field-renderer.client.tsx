'use client'

import { useController } from 'react-hook-form'

import { TextSuggestionsField } from '../../../components/ui/text-suggestions-field.client'
import { useFieldErrorPresentation } from '../../context/array-item-presentation.context'
import { fieldDefaultValue, type TextSuggestionsFieldConfig } from '../../field-config'
import { assertOptionalDisclosureFieldConfig } from '../../config/optional-disclosure-config.lib'
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
        resolved={resolved}
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
  const { field } = useController({
    name: resolved.fullName,
    defaultValue: fieldDefaultValue(resolved.authored),
  })
  const validation = useFieldErrorPresentation(undefined, resolved.fullName)

  return (
    <TextSuggestionsField
      {...buildFieldShellProps(
        {
          config,
          id: resolved.id,
          hint: resolved.hint,
          hintPosition: resolved.hintPosition,
          presentationSize: resolved.presentationSize,
          controlSize: resolved.controlSize,
        },
        validation,
        { sizes: 'both', label: 'visible' },
      )}
      suggestions={suggestions}
      placeholder={config.placeholder}
      value={field.value ?? fieldDefaultValue(config)}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  )
}
