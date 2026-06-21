'use client'

import * as React from 'react'
import { useController, type ControllerRenderProps } from 'react-hook-form'

import { CheckboxField } from '../components/ui/checkbox-field'
import { ChipsField } from '../components/ui/chips-field.client'
import { ComboboxField } from '../components/ui/combobox-field.client'
import { FileField } from '../components/ui/file-field.client'
import { JsonField } from '../components/ui/json-field.client'
import { NumberField } from '../components/ui/number-field'
import { RadioGroupField } from '../components/ui/radio-group-field'
import { RichTextField } from '../components/ui/rich-text-field'
import { SelectField } from '../components/ui/select-field'
import { SwitchField } from '../components/ui/switch-field'
import { TextareaField } from '../components/ui/textarea-field'
import { TextField } from '../components/ui/text-field'
import { useFileFieldRemotePreview } from './file-field-props.context'
import { EditableGridFieldRenderer } from './editable-grid-field.client'
import type { FieldConfig, FieldType } from './field-config'

/** Parses a numeric `<input>` value into `number | undefined` (option A). */
function parseNumber(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? undefined : parsed
}

interface RenderArgs<K extends FieldType> {
  config: Extract<FieldConfig, { type: K }>
  field: ControllerRenderProps
  id: string
  error?: string
  remotePreview?: ReturnType<typeof useFileFieldRemotePreview>
  namePrefix?: string
}

/**
 * Per-type adapter registry: the single place that bridges RHF's `field`
 * (`{ value, onChange, onBlur, ref }`) to each wrapper's prop contract. Adding a
 * new control = adding one entry here. Notable per-type quirks handled below:
 * `number` coerces to `number | undefined`; `select`/`radio` use `onValueChange`;
 * `checkbox`/`switch` use `onCheckedChange` (and checkbox coerces to a boolean).
 */
const fieldRenderers: { [K in FieldType]: (args: RenderArgs<K>) => React.ReactElement } = {
  text: ({ config, field, id, error }) => (
    <TextField
      id={id}
      label={config.label}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      size={config.size}
      type={config.inputType}
      placeholder={config.placeholder}
      autoComplete={config.autoComplete}
      disabled={config.disabled}
      ref={field.ref}
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  number: ({ config, field, id, error }) => (
    <NumberField
      id={id}
      label={config.label}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      inputWidth={config.inputWidth}
      size={config.size}
      placeholder={config.placeholder}
      min={config.min}
      max={config.max}
      step={config.step}
      disabled={config.disabled}
      ref={field.ref}
      value={field.value ?? ''}
      onChange={(event) => field.onChange(parseNumber(event.target.value))}
      onBlur={field.onBlur}
    />
  ),
  textarea: ({ config, field, id, error }) => (
    <TextareaField
      id={id}
      label={config.label}
      error={error}
      hint={config.hint}
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
  ),
  select: ({ config, field, id, error }) => (
    <SelectField
      id={id}
      label={config.label}
      options={config.options}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      size={config.size}
      placeholder={config.placeholder}
      disabled={config.disabled}
      value={field.value != null && field.value !== '' ? String(field.value) : ''}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  radio: ({ config, field, id, error }) => (
    <RadioGroupField
      id={id}
      label={config.label}
      options={config.options}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      disabled={config.disabled}
      value={field.value ?? ''}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  checkbox: ({ config, field, id, error }) => (
    <CheckboxField
      id={id}
      label={config.label}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      disabled={config.disabled}
      checked={field.value ?? false}
      onCheckedChange={(checked) => field.onChange(checked === true)}
      onBlur={field.onBlur}
    />
  ),
  switch: ({ config, field, id, error }) => (
    <SwitchField
      id={id}
      label={config.label}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      disabled={config.disabled}
      checked={field.value ?? false}
      onCheckedChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  json: ({ config, field, id, error }) => (
    <JsonField
      id={id}
      label={config.label}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      size={config.size}
      placeholder={config.placeholder}
      example={config.example}
      disabled={config.disabled}
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  richtext: ({ config, field, id, error }) => (
    <RichTextField
      id={id}
      label={config.label}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      linkable={config.linkable}
      disabled={config.disabled}
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  file: ({ config, field, id, error, remotePreview }) => (
    <FileField
      id={id}
      label={config.label}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      accept={config.accept}
      multiple={config.multiple}
      maxFiles={config.maxFiles}
      maxSize={config.maxSize}
      disabled={config.disabled}
      value={field.value ?? []}
      onChange={field.onChange}
      existingImageUrl={remotePreview?.existingImageUrl}
      existingImageLabel={remotePreview?.existingImageLabel}
      onClearExisting={remotePreview?.onClearExisting}
    />
  ),
  chips: ({ config, field, id, error }) => (
    <ChipsField
      id={id}
      label={config.label}
      options={config.options}
      multiple={config.multiple}
      max={config.max}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      disabled={config.disabled}
      value={field.value ?? (config.multiple === false ? '' : [])}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  combobox: ({ config, field, id, error }) => (
    <ComboboxField
      id={id}
      label={config.label}
      options={config.options}
      multiple={config.multiple}
      max={config.max}
      placeholder={config.placeholder}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      size={config.size}
      disabled={config.disabled}
      value={field.value ?? (config.multiple === false ? '' : [])}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  editableGrid: ({ config, field, id, error, namePrefix }) => (
    <EditableGridFieldRenderer
      config={config}
      field={field}
      id={id}
      error={error}
      namePrefix={namePrefix}
    />
  ),
}

export interface FieldRendererProps {
  config: FieldConfig
  /** Per-`<Form>` id prefix; the control id becomes `${idPrefix}-${name}`. */
  idPrefix: string
  /**
   * Dotted path prefix for array item fields (e.g. `"traits.0"`). When set, the
   * full RHF field name is `${namePrefix}.${config.name}` and the control id
   * becomes `${idPrefix}-${namePrefix}-${config.name}` (dots replaced with `-`).
   */
  namePrefix?: string
}

/**
 * Binds one `FieldConfig` to react-hook-form via `useController` (so only this
 * field re-renders on its own value/error change) and dispatches to the matching
 * adapter. Must be rendered inside a `FormProvider` (the `<Form>` renderer).
 */
export function FieldRenderer({ config, idPrefix, namePrefix }: FieldRendererProps) {
  const fullName = namePrefix ? `${namePrefix}.${config.name}` : config.name
  const { field, fieldState } = useController({ name: fullName })
  const id = `${idPrefix}-${fullName.replaceAll('.', '-')}`
  const remotePreview = useFileFieldRemotePreview(config.name)
  // The registry is keyed by the literal type; TS can't prove the union element
  // matches a single entry, so widen the call signature at this one boundary.
  const render = fieldRenderers[config.type] as (args: RenderArgs<FieldType>) => React.ReactElement
  return render({ config, field, id, error: fieldState.error?.message, remotePreview, namePrefix })
}
