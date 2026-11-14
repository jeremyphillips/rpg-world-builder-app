'use client'

import type { SelectFieldConfig } from '../../../field-config'
import { resolveFieldCopyContext } from '../../../config/field-copy-context.lib'
import { assertOptionalDisclosureFieldConfig } from '../../../config/optional-disclosure-config.lib'
import { buildFieldShellProps } from '../../field-shell-props.lib'
import type { ResolvedFieldRender } from '../../field-resolved-render.types'
import type { SelectFieldChromeProps } from './select-field-renderer.lib'
import {
  SelectFieldCommittedView,
  SelectFieldEditorView,
  SelectFieldReadOnlyView,
} from './select-field-renderer-views.client'
import { useSelectFieldChangePresentation } from './use-select-field-change-presentation.client'
import {
  useSelectFieldRendererState,
  type SelectFieldResolvedStateInput,
} from './use-select-field-renderer-state.client'
import { OptionalDisclosureSelectFieldRenderer } from '../optional-disclosure/optional-disclosure-field-renderer.client'

export interface SelectFieldRendererProps {
  resolved: ResolvedFieldRender
}

function selectStateInput(resolved: ResolvedFieldRender): SelectFieldResolvedStateInput {
  return {
    config: resolved.config as SelectFieldConfig,
    presentationSize: resolved.presentationSize,
    controlSize: resolved.controlSize,
    hint: resolved.hint,
    hintPosition: resolved.hintPosition,
    fullName: resolved.fullName,
    namePrefix: resolved.namePrefix,
  }
}

function selectChrome(
  resolved: ResolvedFieldRender,
  state: ReturnType<typeof useSelectFieldRendererState>,
  sizes: 'both' | 'none',
): SelectFieldChromeProps {
  const shell = buildFieldShellProps(
    {
      config: state.renderConfig,
      id: resolved.id,
      hint: state.hint,
      hintPosition: state.hintPosition,
      presentationSize: state.presentationSize,
      controlSize: state.controlSize,
    },
    state.validation,
    { sizes, label: 'visible' },
  )
  return {
    ...shell,
    ...(sizes === 'none' ? { size: state.controlSize } : {}),
    digits: state.renderConfig.digits,
    sizingLabel: state.renderConfig.sizingLabel,
    sizingLabels: state.renderConfig.sizingLabels,
    labelPosition: state.renderConfig.labelPosition,
  }
}

/** RHF adapter for `SelectField` with array filtering, read-only presentation, and disclosure. */
export function SelectFieldRenderer({ resolved }: SelectFieldRendererProps) {
  const config = resolved.config as SelectFieldConfig
  if (config.optionalDisclosure) {
    assertOptionalDisclosureFieldConfig(config)
    return (
      <OptionalDisclosureSelectFieldRenderer
        config={config}
        disclosure={config.optionalDisclosure}
        resolved={resolved}
      />
    )
  }

  return <BoundSelectField resolved={resolved} />
}

function BoundSelectField({ resolved }: SelectFieldRendererProps) {
  const state = useSelectFieldRendererState(selectStateInput(resolved))
  const copyContext = resolveFieldCopyContext(state.renderConfig)
  const chrome = selectChrome(resolved, state, 'both')
  const changeLabel = state.renderConfig.presentation?.change?.label
  const changePresentation = useSelectFieldChangePresentation({
    changeLabel,
    field: state.field,
    fieldId: resolved.id,
    flatOptions: state.flatOptions,
    onFieldBlur: state.field.onBlur,
  })

  if (state.isReadOnly) {
    return (
      <SelectFieldReadOnlyView
        chrome={chrome}
        displayValue={state.displayValue}
        validation={state.validation}
      />
    )
  }

  if (changeLabel && !changePresentation.showEditor) {
    return (
      <SelectFieldCommittedView
        changeButtonRef={changePresentation.changeButtonRef}
        changeLabel={changeLabel}
        chrome={chrome}
        committedLabel={changePresentation.committedLabel ?? null}
        displayValue={state.displayValue}
        disabled={state.renderConfig.disabled}
        fieldLabel={state.renderConfig.label}
        onBeginChange={changePresentation.beginChange}
        validation={state.validation}
      />
    )
  }

  return (
    <SelectFieldEditorView
      chrome={chrome}
      copyContext={copyContext}
      field={state.field}
      onBlur={changePresentation.exitChangeOnBlur}
      onOpenChange={changePresentation.handleOpenChange}
      onValueChange={changePresentation.handleValueChange}
      renderConfig={state.renderConfig}
      resolvedOptions={state.resolvedOptions}
      validation={state.validation}
      value={changePresentation.value}
    />
  )
}
