'use client'

import { useState } from 'react'
import type { ControllerRenderProps } from 'react-hook-form'

import { FieldReadOnlyValueField } from '../../../components/ui/field-read-only-value.client'
import { OptionalFieldDisclosure } from '../../../components/ui/optional-field-disclosure.client'
import { pickFieldChromeProps } from '../../../components/ui/field-chrome.variants'
import { SelectField } from '../../../components/ui/select-field'
import { TextareaField } from '../../../components/ui/textarea-field'
import type { FieldHintPosition } from '../../../components/ui/field.variants'
import type {
  OptionalDisclosureConfig,
  SelectFieldConfig,
  TextareaFieldConfig,
} from '../../field-config'
import { normalizedSelectFieldValue, pickSelectFieldChromeProps } from './select-field-renderer.lib'
import { useSelectFieldRendererState } from './use-select-field-renderer-state.client'

type OptionalDisclosureTextareaRendererProps = {
  config: TextareaFieldConfig
  disclosure: OptionalDisclosureConfig
  field: ControllerRenderProps
  id: string
  error?: string
  invalid?: boolean
  describedBy?: string
  hint?: string
  hintPosition?: FieldHintPosition
}

export function OptionalDisclosureTextareaFieldRenderer({
  config,
  disclosure,
  field,
  id,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
}: OptionalDisclosureTextareaRendererProps) {
  const [manualOpen, setManualOpen] = useState(false)
  const hasValue = Boolean(String(field.value ?? '').trim())
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const open = manualOpen || (expandWhenPopulated && hasValue)

  const handleRemove = () => {
    field.onChange('')
    setManualOpen(false)
  }

  return (
    <OptionalFieldDisclosure
      controlId={id}
      fieldLabel={config.label}
      addLabel={disclosure.addLabel}
      removeLabel={disclosure.removeLabel}
      open={open}
      onOpenChange={setManualOpen}
      onRemove={handleRemove}
      size={config.size}
    >
      <TextareaField
        id={id}
        {...pickFieldChromeProps(config)}
        label=""
        aria-label={config.label}
        error={error}
        invalid={invalid}
        describedBy={describedBy}
        hint={hint}
        hintPosition={hintPosition}
        info={config.info}
        required={config.required}
        width={config.width}
        size={config.size}
        placeholder={config.placeholder}
        rows={config.rows}
        disabled={config.disabled}
        ref={field.ref}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
    </OptionalFieldDisclosure>
  )
}

export type OptionalDisclosureSelectFieldRendererProps = {
  config: SelectFieldConfig
  disclosure: OptionalDisclosureConfig
  fullName: string
  id: string
  namePrefix?: string
}

function selectFieldHasValue(value: unknown): boolean {
  return value != null && value !== ''
}

/** Optional-disclosure wrapper for schema-driven select fields. */
export function OptionalDisclosureSelectFieldRenderer({
  config,
  disclosure,
  fullName,
  id,
  namePrefix,
}: OptionalDisclosureSelectFieldRendererProps) {
  const state = useSelectFieldRendererState(config, fullName, namePrefix)
  const [manualOpen, setManualOpen] = useState(false)
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const hasValue = selectFieldHasValue(state.field.value)
  const open = manualOpen || (expandWhenPopulated && hasValue)
  const chrome = pickSelectFieldChromeProps(state.renderConfig, {
    hint: state.hint,
    hintPosition: state.hintPosition,
  })

  const handleRemove = () => {
    state.field.onChange('')
    setManualOpen(false)
  }

  if (state.isReadOnly) {
    return (
      <FieldReadOnlyValueField
        id={id}
        displayValue={state.displayValue}
        {...chrome}
        {...state.validation}
      />
    )
  }

  return (
    <OptionalFieldDisclosure
      controlId={id}
      fieldLabel={state.renderConfig.label}
      addLabel={disclosure.addLabel}
      removeLabel={disclosure.removeLabel}
      open={open}
      onOpenChange={setManualOpen}
      onRemove={handleRemove}
      size={state.renderConfig.size}
    >
      <SelectField
        id={id}
        options={state.resolvedOptions}
        placeholder={state.renderConfig.placeholder}
        name={state.field.name}
        disabled={state.renderConfig.disabled}
        value={normalizedSelectFieldValue(state.field.value)}
        onValueChange={state.field.onChange}
        onBlur={state.field.onBlur}
        {...chrome}
        label=""
        aria-label={state.renderConfig.label}
        {...state.validation}
      />
    </OptionalFieldDisclosure>
  )
}
