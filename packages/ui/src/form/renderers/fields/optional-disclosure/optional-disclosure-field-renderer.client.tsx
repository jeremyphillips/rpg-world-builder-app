'use client'

import { useEffect, useRef, useState } from 'react'
import type { ControllerRenderProps } from 'react-hook-form'
import { useController, useFormState } from 'react-hook-form'

import { normalizeRichTextHtml } from '../../../../components/ui/rich-text-html'
import { FieldReadOnlyValueField } from '../../../../components/ui/field-read-only-value.client'
import { OptionalFieldDisclosure } from '../../../../components/ui/optional-field-disclosure.client'
import { buildFieldShellProps } from '../../field-shell-props.lib'
import type { ResolvedFieldRender } from '../../field-resolved-render.types'
import { SelectField } from '../../../../components/ui/select-field'
import { TextField } from '../../../../components/ui/text-field'
import { TextareaField } from '../../../../components/ui/textarea-field'
import { TextSuggestionsField } from '../../../../components/ui/text-suggestions-field.client'
import type { FieldHintPosition } from '../../../../components/ui/field.variants'
import type { FieldSize } from '../../../../components/ui/field.client'
import { useDependsOnValues } from '../../../config/form-depends-on.client'
import { useFieldErrorPresentation } from '../../../context/array-item-presentation.context'
import type {
  OptionalDisclosureConfig,
  RichTextFieldConfig,
  TextFieldConfig,
  SelectFieldConfig,
  TextareaFieldConfig,
  TextSuggestionsFieldConfig,
} from '../../../field-config'
import { LazyFieldSuspense } from '../../lazy-field.client'
import { LazyRichTextField } from '../lazy-rich-text-field.client'
import { fieldDefaultValue } from '../../../field-config'
import { optionalDisclosureLeafFieldConfig } from '../../../config/optional-disclosure-config.lib'
import { useConfirmBeforeClear } from '../../../config/use-confirm-before-clear.client'
import { normalizedSelectFieldValue } from '../select/select-field-renderer.lib'
import { useSelectFieldRendererState } from '../select/use-select-field-renderer-state.client'

function richTextHtml(value: unknown): string {
  return normalizeRichTextHtml(typeof value === 'string' ? value : undefined)
}

function valueAtPath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (current == null || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[segment]
  }, source)
}

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
  presentationSize: FieldSize
  controlSize: FieldSize
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
  presentationSize,
  controlSize,
}: OptionalDisclosureTextareaRendererProps) {
  const { ref: registerRef, value, onChange, onBlur } = field
  const [manualOpen, setManualOpen] = useState(false)
  const hasValue = Boolean(String(value ?? '').trim())
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const open = manualOpen || (expandWhenPopulated && hasValue)

  const clearValue = () => {
    onChange('')
    setManualOpen(false)
  }
  const { attemptClear, confirmDialog } = useConfirmBeforeClear({
    confirmBeforeClear: disclosure.confirmBeforeClear,
    clearingFields: [config],
    onClear: clearValue,
  })

  return (
    <>
      <OptionalFieldDisclosure
        controlId={id}
        fieldLabel={config.label}
        addLabel={disclosure.addLabel}
        removeLabel={disclosure.removeLabel}
        open={open}
        onOpenChange={setManualOpen}
        onRemove={attemptClear}
        size={controlSize}
      >
        <TextareaField
          {...buildFieldShellProps(
            {
              config: optionalDisclosureLeafFieldConfig(config),
              id,
              hint,
              hintPosition,
              presentationSize,
              controlSize,
            },
            { error, invalid, describedBy },
            { sizes: 'both', label: 'accessible-name' },
          )}
          placeholder={config.placeholder}
          rows={config.rows}
          disabled={config.disabled}
          ref={registerRef}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
        />
      </OptionalFieldDisclosure>
      {confirmDialog}
    </>
  )
}

type OptionalDisclosureTextRendererProps = {
  config: TextFieldConfig
  disclosure: OptionalDisclosureConfig
  field: ControllerRenderProps
  id: string
  error?: string
  invalid?: boolean
  describedBy?: string
  hint?: string
  hintPosition?: FieldHintPosition
  presentationSize: FieldSize
  controlSize: FieldSize
}

/** Collapses an empty single-line field. Opening an empty value does not write form state. */
export function OptionalDisclosureTextFieldRenderer({
  config,
  disclosure,
  field,
  id,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
  presentationSize,
  controlSize,
}: OptionalDisclosureTextRendererProps) {
  const { ref: registerRef, value, onChange, onBlur, name } = field
  const [manualOpen, setManualOpen] = useState(false)
  const hasValue = Boolean(String(value ?? '').trim())
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const open = manualOpen || (expandWhenPopulated && hasValue)
  const { defaultValues } = useFormState({ name })
  const defaultsRef = useRef<unknown>(undefined)

  useEffect(() => {
    if (defaultsRef.current === undefined && defaultValues !== undefined) {
      defaultsRef.current = defaultValues
      return
    }
    if (defaultsRef.current === defaultValues) return
    defaultsRef.current = defaultValues
    setManualOpen(false)
  }, [defaultValues])

  const clearValue = () => {
    onChange('')
    setManualOpen(false)
  }
  const { attemptClear, confirmDialog } = useConfirmBeforeClear({
    confirmBeforeClear: disclosure.confirmBeforeClear,
    clearingFields: [config],
    onClear: clearValue,
  })

  return (
    <>
      <OptionalFieldDisclosure
        controlId={id}
        fieldLabel={config.label}
        addLabel={disclosure.addLabel}
        removeLabel={disclosure.removeLabel}
        open={open}
        onOpenChange={setManualOpen}
        onRemove={attemptClear}
        size={controlSize}
      >
        <TextField
          {...buildFieldShellProps(
            {
              config: optionalDisclosureLeafFieldConfig(config),
              id,
              hint,
              hintPosition,
              presentationSize,
              controlSize,
            },
            { error, invalid, describedBy },
            { sizes: 'both', label: 'accessible-name' },
          )}
          placeholder={config.placeholder}
          disabled={config.disabled}
          ref={registerRef}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          onBlur={onBlur}
        />
      </OptionalFieldDisclosure>
      {confirmDialog}
    </>
  )
}

export type OptionalDisclosureSelectFieldRendererProps = {
  config: SelectFieldConfig
  disclosure: OptionalDisclosureConfig
  resolved: ResolvedFieldRender
}

function selectFieldHasValue(value: unknown): boolean {
  return value != null && value !== ''
}

/** Optional-disclosure wrapper for schema-driven select fields. */
export function OptionalDisclosureSelectFieldRenderer({
  config,
  disclosure,
  resolved,
}: OptionalDisclosureSelectFieldRendererProps) {
  const state = useSelectFieldRendererState({
    config,
    presentationSize: resolved.presentationSize,
    controlSize: resolved.controlSize,
    hint: resolved.hint,
    hintPosition: resolved.hintPosition,
    fullName: resolved.fullName,
    namePrefix: resolved.namePrefix,
  })
  const [manualOpen, setManualOpen] = useState(false)
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const hasValue = selectFieldHasValue(state.field.value)
  const open = manualOpen || (expandWhenPopulated && hasValue)
  const leafConfig = optionalDisclosureLeafFieldConfig(state.renderConfig)
  const readOnlyShellConfig = { ...state.renderConfig, width: 'full' as const }
  const shellSource = {
    config: leafConfig,
    id: resolved.id,
    hint: state.hint,
    hintPosition: state.hintPosition,
    presentationSize: state.presentationSize,
    controlSize: state.controlSize,
  }
  const readOnlyShellSource = { ...shellSource, config: readOnlyShellConfig }
  const selectExtras = {
    digits: state.renderConfig.digits,
    sizingLabel: state.renderConfig.sizingLabel,
    sizingLabels: state.renderConfig.sizingLabels,
    labelPosition: state.renderConfig.labelPosition,
  }
  const readOnlyChrome = {
    ...buildFieldShellProps(readOnlyShellSource, state.validation, {
      sizes: 'both',
      label: 'visible',
    }),
    ...selectExtras,
  }
  const editorChrome = {
    ...buildFieldShellProps(shellSource, state.validation, {
      sizes: 'both',
      label: 'accessible-name',
    }),
    ...selectExtras,
  }

  const clearValue = () => {
    state.field.onChange('')
    setManualOpen(false)
  }
  const { attemptClear, confirmDialog } = useConfirmBeforeClear({
    confirmBeforeClear: disclosure.confirmBeforeClear,
    clearingFields: [config],
    onClear: clearValue,
  })

  if (state.isReadOnly) {
    return (
      <FieldReadOnlyValueField
        displayValue={state.displayValue}
        {...readOnlyChrome}
        {...state.validation}
      />
    )
  }

  return (
    <>
      <OptionalFieldDisclosure
        controlId={resolved.id}
        fieldLabel={state.renderConfig.label}
        addLabel={disclosure.addLabel}
        removeLabel={disclosure.removeLabel}
        open={open}
        onOpenChange={setManualOpen}
        onRemove={attemptClear}
        size={state.controlSize}
      >
        <SelectField
          options={state.resolvedOptions}
          placeholder={state.renderConfig.placeholder}
          name={state.field.name}
          disabled={state.renderConfig.disabled}
          value={normalizedSelectFieldValue(state.field.value)}
          onValueChange={state.field.onChange}
          onBlur={state.field.onBlur}
          {...editorChrome}
          {...state.validation}
        />
      </OptionalFieldDisclosure>
      {confirmDialog}
    </>
  )
}

export type OptionalDisclosureTextSuggestionsFieldRendererProps = {
  config: TextSuggestionsFieldConfig
  disclosure: OptionalDisclosureConfig
  suggestions: readonly string[]
  resolved: ResolvedFieldRender
}

/** Optional-disclosure wrapper for schema-driven text-suggestions fields. */
export function OptionalDisclosureTextSuggestionsFieldRenderer({
  config,
  disclosure,
  suggestions,
  resolved,
}: OptionalDisclosureTextSuggestionsFieldRendererProps) {
  const suggestionValues = useDependsOnValues(config.suggestions.dependsOn, resolved.namePrefix)
  const suggestionValuesKey = JSON.stringify(suggestionValues)

  const { field } = useController({
    name: resolved.fullName,
    defaultValue: fieldDefaultValue(resolved.authored),
  })
  const validation = useFieldErrorPresentation(undefined, resolved.fullName)

  const [manualOpen, setManualOpen] = useState(false)
  const [dependencyCollapsed, setDependencyCollapsed] = useState(false)
  const hasValue = Boolean(String(field.value ?? '').trim())
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const open = !dependencyCollapsed && (manualOpen || (expandWhenPopulated && hasValue))

  useEffect(() => {
    // Reset disclosure when suggestion drivers change; must stay synchronous so
    // Form valueSync effects in the same commit clear dependent values first.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- disclosure reset is intentionally ordered with FormValueSyncEffects in the parent commit
    setManualOpen(false)
    setDependencyCollapsed(true)
  }, [suggestionValuesKey])

  useEffect(() => {
    if (hasValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- expand populated optional fields when value sync repopulates the control
      setDependencyCollapsed(false)
    }
  }, [hasValue])

  const handleOpenChange = (nextOpen: boolean) => {
    setManualOpen(nextOpen)
    if (nextOpen) {
      setDependencyCollapsed(false)
    }
  }

  const clearValue = () => {
    field.onChange('')
    setManualOpen(false)
    setDependencyCollapsed(false)
  }
  const { attemptClear, confirmDialog } = useConfirmBeforeClear({
    confirmBeforeClear: disclosure.confirmBeforeClear,
    clearingFields: [config],
    onClear: clearValue,
  })

  return (
    <>
      <OptionalFieldDisclosure
        controlId={resolved.id}
        fieldLabel={config.label}
        addLabel={disclosure.addLabel}
        removeLabel={disclosure.removeLabel}
        open={open}
        onOpenChange={handleOpenChange}
        onRemove={attemptClear}
        size={resolved.controlSize}
      >
        <TextSuggestionsField
          {...buildFieldShellProps(
            {
              config: optionalDisclosureLeafFieldConfig(config),
              id: resolved.id,
              hint: resolved.hint,
              hintPosition: resolved.hintPosition,
              presentationSize: resolved.presentationSize,
              controlSize: resolved.controlSize,
            },
            validation,
            { sizes: 'both', label: 'accessible-name' },
          )}
          suggestions={suggestions}
          placeholder={config.placeholder}
          value={field.value ?? fieldDefaultValue(config)}
          onValueChange={field.onChange}
          onBlur={field.onBlur}
          {...validation}
        />
      </OptionalFieldDisclosure>
      {confirmDialog}
    </>
  )
}

type OptionalDisclosureRichTextRendererProps = {
  config: RichTextFieldConfig
  disclosure: OptionalDisclosureConfig
  field: ControllerRenderProps
  id: string
  error?: string
  invalid?: boolean
  describedBy?: string
  hint?: string
  hintPosition?: FieldHintPosition
  presentationSize: FieldSize
  controlSize: FieldSize
}

/** Collapses empty rich text. Clearing the editor does not close it; reset does. */
export function OptionalDisclosureRichTextFieldRenderer({
  config,
  disclosure,
  field,
  id,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
  presentationSize,
  controlSize,
}: OptionalDisclosureRichTextRendererProps) {
  const { value, onChange, onBlur, name } = field
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const [open, setOpen] = useState(() => expandWhenPopulated && richTextHtml(value).length > 0)
  const { defaultValues } = useFormState({ name })
  const defaultsRef = useRef<unknown>(undefined)

  useEffect(() => {
    if (defaultsRef.current === undefined && defaultValues !== undefined) {
      defaultsRef.current = defaultValues
      return
    }
    if (defaultsRef.current === defaultValues) return
    defaultsRef.current = defaultValues
    const next = richTextHtml(valueAtPath(defaultValues, name))
    setOpen(expandWhenPopulated && next.length > 0)
  }, [defaultValues, expandWhenPopulated, name])

  const clearValue = () => {
    onChange('')
    setOpen(false)
  }
  const { attemptClear, confirmDialog } = useConfirmBeforeClear({
    confirmBeforeClear: disclosure.confirmBeforeClear,
    clearingFields: [config],
    onClear: clearValue,
  })

  return (
    <>
      <OptionalFieldDisclosure
        controlId={id}
        fieldLabel={config.label}
        addLabel={disclosure.addLabel}
        removeLabel={disclosure.removeLabel}
        open={open}
        onOpenChange={setOpen}
        onRemove={attemptClear}
        size={controlSize}
      >
        <LazyFieldSuspense>
          <LazyRichTextField
            {...buildFieldShellProps(
              {
                config: optionalDisclosureLeafFieldConfig(config),
                id,
                hint,
                hintPosition,
                presentationSize,
                controlSize,
              },
              { error, invalid, describedBy },
              { sizes: 'both', label: 'visible' },
            )}
            labelVisibility="srOnly"
            linkable={config.linkable}
            codeBlocks={config.codeBlocks}
            tables={config.tables}
            internalLinkOptions={config.internalLinkOptions}
            contentTypeOptions={config.contentTypeOptions}
            disabled={config.disabled}
            value={typeof value === 'string' ? value : ''}
            onChange={onChange}
            onBlur={onBlur}
          />
        </LazyFieldSuspense>
      </OptionalFieldDisclosure>
      {confirmDialog}
    </>
  )
}
