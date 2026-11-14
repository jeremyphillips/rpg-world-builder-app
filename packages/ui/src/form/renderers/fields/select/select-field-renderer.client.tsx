'use client'

import type { SelectFieldConfig } from '../../../field-config'
import { resolveFieldCopyContext } from '../../../config/field-copy-context.lib'
import { pickSelectFieldChromeProps } from './select-field-renderer.lib'
import {
  SelectFieldCommittedView,
  SelectFieldEditorView,
  SelectFieldReadOnlyView,
} from './select-field-renderer-views.client'
import { useSelectFieldChangePresentation } from './use-select-field-change-presentation.client'
import { useSelectFieldRendererState } from './use-select-field-renderer-state.client'

export interface SelectFieldRendererProps {
  config: SelectFieldConfig
  fullName: string
  id: string
  namePrefix?: string
}

/** RHF adapter for `SelectField` with array filtering and read-only presentation. */
export function SelectFieldRenderer({
  config,
  fullName,
  id,
  namePrefix,
}: SelectFieldRendererProps) {
  const state = useSelectFieldRendererState(config, fullName, namePrefix)
  const copyContext = resolveFieldCopyContext(state.renderConfig)
  const chrome = pickSelectFieldChromeProps(state.renderConfig, {
    hint: state.hint,
    hintPosition: state.hintPosition,
    size: state.presentationSize,
    controlSize: state.controlSize,
  })
  const changeLabel = state.renderConfig.presentation?.change?.label
  const changePresentation = useSelectFieldChangePresentation({
    changeLabel,
    field: state.field,
    fieldId: id,
    flatOptions: state.flatOptions,
    onFieldBlur: state.field.onBlur,
  })

  if (state.isReadOnly) {
    return (
      <SelectFieldReadOnlyView
        chrome={chrome}
        displayValue={state.displayValue}
        fieldId={id}
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
        fieldId={id}
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
      fieldId={id}
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
