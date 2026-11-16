'use client'

import * as React from 'react'
import { useController, useFormContext, useFormState } from 'react-hook-form'

import { useFieldErrorPresentation } from '../context/array-item-presentation.context'
import { useFileFieldRemotePreview } from '../context/file-field-props.context'
import { assertOptionalDisclosureFieldConfig } from '../config/optional-disclosure-config.lib'
import {
  fieldDefaultValue,
  resolveFieldConfigBoundNames,
  resolveFieldConfigPrimaryName,
  type FieldType,
} from '../field-config'
import { resolveFieldLabelVisibility } from '../form-heading.lib'
import { fieldRenderers, type RenderArgs } from './field-renderer-adapters.client'
import type { StandardRegistryFieldConfig } from './field-renderer-families.lib'
import type { ResolvedFieldRender } from './field-resolved-render.types'
import {
  OptionalDisclosureRichTextFieldRenderer,
  OptionalDisclosureTextareaFieldRenderer,
  OptionalDisclosureTextFieldRenderer,
} from './fields/optional-disclosure/optional-disclosure-field-renderer.client'
import { OptionalDisclosureComboboxFieldRenderer } from './fields/optional-disclosure/optional-disclosure-combobox-field-renderer.client'

/**
 * Single-controller binding and progressive validation. Composites, select, and
 * text suggestions keep their own controllers.
 */
export function StandardFieldRenderer({ resolved }: { resolved: ResolvedFieldRender }) {
  const renderConfig = resolved.config as StandardRegistryFieldConfig
  const { getFieldState, trigger } = useFormContext()
  const { field } = useController({
    name: resolved.fullName,
    defaultValue: fieldDefaultValue(resolved.authored),
  })
  const formState = useFormState({ name: resolved.fullName, exact: true })
  const boundPaths = React.useMemo(
    () =>
      resolveFieldConfigBoundNames(renderConfig).map((name) =>
        resolved.namePrefix ? `${resolved.namePrefix}.${name}` : name,
      ),
    [resolved.namePrefix, renderConfig],
  )
  const runFieldTrigger = React.useCallback(() => {
    void trigger(boundPaths.length === 1 ? boundPaths[0]! : boundPaths, { shouldFocus: false })
  }, [boundPaths, trigger])
  const progressiveField = {
    ...field,
    onBlur: () => {
      field.onBlur()
      runFieldTrigger()
    },
    onChange: (value: Parameters<typeof field.onChange>[0]) => {
      field.onChange(value)
      if (getFieldState(resolved.fullName, formState).isTouched) {
        runFieldTrigger()
      }
    },
  }
  const remotePreview = useFileFieldRemotePreview(resolveFieldConfigPrimaryName(resolved.authored))
  const validation = useFieldErrorPresentation(undefined, resolved.fullName)
  assertOptionalDisclosureFieldConfig(resolved.authored)
  const labelVisibility = resolveFieldLabelVisibility(renderConfig)

  if (renderConfig.type === 'text' && renderConfig.optionalDisclosure) {
    return (
      <OptionalDisclosureTextFieldRenderer
        config={renderConfig}
        disclosure={renderConfig.optionalDisclosure}
        field={progressiveField}
        id={resolved.id}
        hint={resolved.hint}
        hintPosition={resolved.hintPosition}
        presentationSize={resolved.presentationSize}
        controlSize={resolved.controlSize}
        {...validation}
      />
    )
  }

  if (renderConfig.type === 'textarea' && renderConfig.optionalDisclosure) {
    return (
      <OptionalDisclosureTextareaFieldRenderer
        config={renderConfig}
        disclosure={renderConfig.optionalDisclosure}
        field={progressiveField}
        id={resolved.id}
        hint={resolved.hint}
        hintPosition={resolved.hintPosition}
        presentationSize={resolved.presentationSize}
        controlSize={resolved.controlSize}
        {...validation}
      />
    )
  }

  if (renderConfig.type === 'richtext' && renderConfig.optionalDisclosure) {
    return (
      <OptionalDisclosureRichTextFieldRenderer
        config={renderConfig}
        disclosure={renderConfig.optionalDisclosure}
        field={progressiveField}
        id={resolved.id}
        hint={resolved.hint}
        hintPosition={resolved.hintPosition}
        presentationSize={resolved.presentationSize}
        controlSize={resolved.controlSize}
        {...validation}
      />
    )
  }

  if (renderConfig.type === 'combobox' && renderConfig.optionalDisclosure) {
    return (
      <OptionalDisclosureComboboxFieldRenderer
        config={renderConfig}
        disclosure={renderConfig.optionalDisclosure}
        field={progressiveField}
        id={resolved.id}
        hint={resolved.hint}
        hintPosition={resolved.hintPosition}
        presentationSize={resolved.presentationSize}
        controlSize={resolved.controlSize}
        namePrefix={resolved.namePrefix}
        {...validation}
      />
    )
  }

  const render = fieldRenderers[renderConfig.type] as (
    args: RenderArgs<FieldType>,
  ) => React.ReactElement
  return render({
    config: renderConfig,
    presentationSize: resolved.presentationSize,
    controlSize: resolved.controlSize,
    field: progressiveField,
    id: resolved.id,
    hint: resolved.hint,
    hintPosition: resolved.hintPosition,
    hintIcon: resolved.hintIcon,
    labelVisibility,
    ...validation,
    remotePreview,
    namePrefix: resolved.namePrefix,
  })
}
