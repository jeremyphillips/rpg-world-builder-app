'use client'

import { useEffect, useState } from 'react'
import type { ControllerRenderProps } from 'react-hook-form'
import { useController, useFormState } from 'react-hook-form'

import { FieldReadOnlyValueField } from '../../../components/ui/field-read-only-value.client'
import { OptionalFieldDisclosure } from '../../../components/ui/optional-field-disclosure.client'
import { pickFieldChromeProps } from '../../../components/ui/field-chrome.variants'
import { SelectField } from '../../../components/ui/select-field'
import { TextareaField } from '../../../components/ui/textarea-field'
import { TextSuggestionsField } from '../../../components/ui/text-suggestions-field.client'
import type { FieldHintPosition } from '../../../components/ui/field.variants'
import { resolveInheritedFieldSize } from '../../../components/ui/field.variants'
import { useDependsOnValues } from '../../config/form-depends-on.client'
import { useFieldErrorPresentation } from '../../context/array-item-presentation.context'
import { resolveNestedFieldErrorMessage } from '../../errors/resolve-field-error-message'
import type {
  OptionalDisclosureConfig,
  SelectFieldConfig,
  TextareaFieldConfig,
  TextSuggestionsFieldConfig,
} from '../../field-config'
import { fieldDefaultValue, resolveFieldHintPresentation } from '../../field-config'
import { useFormSectionContext } from '../../context/form-section.context'
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

export type OptionalDisclosureTextSuggestionsFieldRendererProps = {
  config: TextSuggestionsFieldConfig
  disclosure: OptionalDisclosureConfig
  fullName: string
  id: string
  namePrefix?: string
}

/** Optional-disclosure wrapper for schema-driven text-suggestions fields. */
export function OptionalDisclosureTextSuggestionsFieldRenderer({
  config,
  disclosure,
  fullName,
  id,
  namePrefix,
}: OptionalDisclosureTextSuggestionsFieldRendererProps) {
  const { size: inheritedSize } = useFormSectionContext()
  const suggestionValues = useDependsOnValues(config.suggestions.dependsOn, namePrefix)
  const suggestionValuesKey = JSON.stringify(suggestionValues)
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

  const [manualOpen, setManualOpen] = useState(false)
  const [dependencyCollapsed, setDependencyCollapsed] = useState(false)
  const hasValue = Boolean(String(field.value ?? '').trim())
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const open = !dependencyCollapsed && (manualOpen || (expandWhenPopulated && hasValue))

  useEffect(() => {
    setManualOpen(false)
    setDependencyCollapsed(true)
  }, [suggestionValuesKey])

  useEffect(() => {
    if (hasValue) {
      setDependencyCollapsed(false)
    }
  }, [hasValue])

  const handleOpenChange = (nextOpen: boolean) => {
    setManualOpen(nextOpen)
    if (nextOpen) {
      setDependencyCollapsed(false)
    }
  }

  const handleRemove = () => {
    field.onChange('')
    setManualOpen(false)
    setDependencyCollapsed(false)
  }

  return (
    <OptionalFieldDisclosure
      controlId={id}
      fieldLabel={config.label}
      addLabel={disclosure.addLabel}
      removeLabel={disclosure.removeLabel}
      open={open}
      onOpenChange={handleOpenChange}
      onRemove={handleRemove}
      size={size}
    >
      <TextSuggestionsField
        id={id}
        {...pickFieldChromeProps(config)}
        label=""
        ariaLabel={config.label}
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
    </OptionalFieldDisclosure>
  )
}
