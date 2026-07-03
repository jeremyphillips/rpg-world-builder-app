'use client'

import * as React from 'react'
import {
  useController,
  useFormContext,
  useFormState,
  type ControllerRenderProps,
} from 'react-hook-form'

import { CheckboxField } from '../../components/ui/checkbox-field'
import { ChipsField } from '../../components/ui/chips-field.client'
import { ComboboxField } from '../../components/ui/combobox-field.client'
import { NumberField } from '../../components/ui/number-field'
import { RadioCardField } from '../../components/ui/radio-card-field'
import { RadioGroupField } from '../../components/ui/radio-group-field'
import { SelectField } from '../../components/ui/select-field'
import { SwitchField } from '../../components/ui/switch-field'
import { TextareaField } from '../../components/ui/textarea-field'
import { TextField } from '../../components/ui/text-field'
import { MarkdownField } from '../../components/ui/markdown-field.client'
import { useFileFieldRemotePreview } from '../context/file-field-props.context'
import { useFieldErrorPresentation } from '../context/array-item-presentation.context'
import { resolveNestedFieldErrorMessage } from '../errors/resolve-field-error-message'
import { InputSelectFieldRenderer } from './input-select-field-renderer.client'
import { InputUnitFieldRenderer } from './input-unit-field-renderer.client'
import {
  chooseFromChipsToInlineSentence,
  inlineChooseCountToInlineSentence,
} from '../config/inline-sentence-legacy-config.lib'
import { DiceFormulaFieldRenderer } from './dice-formula-field-renderer.client'
import { InlineSentenceFieldRenderer } from './inline-sentence-field-renderer.client'
import { LevelRangeFieldRenderer } from './level-range-field-renderer.client'
import { LazyFieldSuspense, lazyFieldComponent } from './lazy-field.client'
import type {
  FieldConfig,
  FieldType,
  InputSelectFieldConfig,
  InlineSentenceFieldConfig,
  InlineChooseCountFieldConfig,
  ChooseFromChipsFieldConfig,
  InputUnitFieldConfig,
  LevelRangeFieldConfig,
} from '../field-config'
import {
  applyOptionAvailabilityToFieldOptions,
  applyOptionAvailabilityToSelectOptions,
  fieldDefaultValue,
  resolveFieldHint,
} from '../field-config'
import { useDependsOnValues } from '../config/form-depends-on.client'
import { useFormSectionContext } from '../context/form-section.context'
import { resolveInheritedFieldSize } from '../../components/ui/field.variants'
import type { JsonFieldProps } from '../../components/ui/json-field.client'
import type { RichTextFieldProps } from '../../components/ui/rich-text-field'
import type { FileFieldProps } from '../../components/ui/file-field.client'
import type { EditableGridFieldRendererProps } from './editable-grid-field-renderer.client'

const LazyJsonField = lazyFieldComponent<JsonFieldProps>(
  () => import('../../components/ui/json-field.client'),
  'JsonField',
)
const LazyRichTextField = lazyFieldComponent<RichTextFieldProps>(
  () => import('../../components/ui/rich-text-field'),
  'RichTextField',
)
const LazyFileField = lazyFieldComponent<FileFieldProps>(
  () => import('../../components/ui/file-field.client'),
  'FileField',
)
const LazyEditableGridFieldRenderer = lazyFieldComponent<EditableGridFieldRendererProps>(
  () => import('./editable-grid-field-renderer.client'),
  'EditableGridFieldRenderer',
)

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
  invalid?: boolean
  describedBy?: string
  remotePreview?: ReturnType<typeof useFileFieldRemotePreview>
  namePrefix?: string
}

function fieldValidationProps({
  error,
  invalid,
  describedBy,
}: Pick<RenderArgs<FieldType>, 'error' | 'invalid' | 'describedBy'>) {
  return { error, invalid, describedBy }
}

/**
 * Per-type adapter registry: the single place that bridges RHF's `field`
 * (`{ value, onChange, onBlur, ref }`) to each wrapper's prop contract. Adding a
 * new control = adding one entry here. Notable per-type quirks handled below:
 * `number` coerces to `number | undefined`; `select`/`radio`/`radioCard` use `onValueChange`;
 * `checkbox`/`switch` use `onCheckedChange` (and checkbox coerces to a boolean).
 */
const fieldRenderers: {
  [K in Exclude<
    FieldType,
    | 'inputSelect'
    | 'levelRange'
    | 'inlineSentence'
    | 'inlineChooseCount'
    | 'chooseFromChips'
    | 'inputUnit'
  >]: (args: RenderArgs<K>) => React.ReactElement
} = {
  text: ({ config, field, id, ...validation }) => (
    <TextField
      id={id}
      label={config.label}
      {...fieldValidationProps(validation)}
      hint={config.hint}
      hintPosition={config.hintPosition}
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
  number: ({ config, field, id, ...validation }) => (
    <NumberField
      id={id}
      label={config.label}
      {...fieldValidationProps(validation)}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      width={config.width}
      inputWidth={config.inputWidth}
      size={config.size}
      placeholder={config.placeholder}
      disabled={config.disabled}
      step={config.step}
      stepperMin={config.min}
      stepperMax={config.max}
      digits={config.digits}
      labelPosition={config.labelPosition}
      ref={field.ref}
      value={field.value ?? ''}
      onChange={(event) => field.onChange(parseNumber(event.target.value))}
      onBlur={field.onBlur}
    />
  ),
  textarea: ({ config, field, id, ...validation }) => (
    <TextareaField
      id={id}
      label={config.label}
      {...fieldValidationProps(validation)}
      hint={config.hint}
      hintPosition={config.hintPosition}
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
  select: ({ config, field, id, ...validation }) => (
    <SelectField
      id={id}
      label={config.label}
      options={config.options}
      {...fieldValidationProps(validation)}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      width={config.width}
      size={config.size}
      digits={config.digits}
      labelPosition={config.labelPosition}
      placeholder={config.placeholder}
      disabled={config.disabled}
      value={field.value != null && field.value !== '' ? String(field.value) : ''}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  radio: ({ config, field, id, ...validation }) => (
    <RadioGroupField
      id={id}
      label={config.label}
      options={config.options}
      {...fieldValidationProps(validation)}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      width={config.width}
      disabled={config.disabled}
      orientation={config.orientation}
      labelHidden={config.labelHidden}
      value={field.value ?? ''}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  radioCard: ({ config, field, id, ...validation }) => (
    <RadioCardField
      id={id}
      label={config.label}
      options={config.options}
      {...fieldValidationProps(validation)}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      width={config.width}
      disabled={config.disabled}
      labelHidden={config.labelHidden}
      value={field.value ?? ''}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  checkbox: ({ config, field, id, ...validation }) => (
    <CheckboxField
      id={id}
      label={config.label}
      {...fieldValidationProps(validation)}
      hint={config.hint}
      info={config.info}
      required={config.required}
      width={config.width}
      size={config.size}
      disabled={config.disabled}
      checked={field.value ?? false}
      onCheckedChange={(checked) => field.onChange(checked === true)}
      onBlur={field.onBlur}
    />
  ),
  switch: ({ config, field, id, ...validation }) => (
    <SwitchField
      id={id}
      label={config.label}
      labelPosition={config.labelPosition}
      {...fieldValidationProps(validation)}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      width={config.width}
      size={config.size}
      disabled={config.disabled}
      checked={field.value ?? false}
      onCheckedChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  json: ({ config, field, id, ...validation }) => (
    <LazyFieldSuspense>
      <LazyJsonField
        id={id}
        label={config.label}
        {...fieldValidationProps(validation)}
        hint={config.hint}
        hintPosition={config.hintPosition}
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
    </LazyFieldSuspense>
  ),
  richtext: ({ config, field, id, ...validation }) => (
    <LazyFieldSuspense>
      <LazyRichTextField
        id={id}
        label={config.label}
        {...fieldValidationProps(validation)}
        hint={config.hint}
        hintPosition={config.hintPosition}
        info={config.info}
        required={config.required}
        width={config.width}
        size={config.size}
        linkable={config.linkable}
        codeBlocks={config.codeBlocks}
        internalLinkOptions={config.internalLinkOptions}
        contentTypeOptions={config.contentTypeOptions}
        disabled={config.disabled}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
    </LazyFieldSuspense>
  ),
  markdown: ({ config, field, id, ...validation }) => (
    <MarkdownField
      id={id}
      label={config.label}
      {...fieldValidationProps(validation)}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      width={config.width}
      size={config.size}
      rows={config.rows}
      placeholder={config.placeholder}
      disabled={config.disabled}
      value={field.value ?? ''}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  file: ({ config, field, id, remotePreview, ...validation }) => (
    <LazyFieldSuspense>
      <LazyFileField
        id={id}
        label={config.label}
        {...fieldValidationProps(validation)}
        hint={config.hint}
        hintPosition={config.hintPosition}
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
    </LazyFieldSuspense>
  ),
  chips: ({ config, field, id, ...validation }) => (
    <ChipsField
      id={id}
      label={config.label}
      options={config.options}
      multiple={config.multiple}
      max={config.max}
      {...fieldValidationProps(validation)}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      size={config.size}
      chipSize={config.chipSize}
      width={config.width}
      disabled={config.disabled}
      value={field.value ?? fieldDefaultValue(config)}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  ),
  combobox: ({ config, field, id, ...validation }) => (
    <ComboboxField
      id={id}
      label={config.label}
      options={config.options}
      multiple={config.multiple}
      max={config.max}
      placeholder={config.placeholder}
      {...fieldValidationProps(validation)}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      width={config.width}
      size={config.size}
      disabled={config.disabled}
      value={field.value ?? fieldDefaultValue(config)}
      onChange={field.onChange}
      onBlur={field.onBlur}
      renderSelectedItem={config.renderSelectedItem}
    />
  ),
  editableGrid: ({ config, field, id, namePrefix, ...validation }) => (
    <LazyFieldSuspense>
      <LazyEditableGridFieldRenderer
        config={config}
        field={field}
        id={id}
        {...fieldValidationProps(validation)}
        namePrefix={namePrefix}
      />
    </LazyFieldSuspense>
  ),
  diceFormula: ({ config, field, id, namePrefix, ...validation }) => (
    <DiceFormulaFieldRenderer
      config={config}
      field={field}
      id={id}
      {...fieldValidationProps(validation)}
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
  const { size: inheritedSize } = useFormSectionContext()
  const fullName = namePrefix ? `${namePrefix}.${config.name}` : config.name
  const id = `${idPrefix}-${fullName.replaceAll('.', '-')}`

  const hintValues = useDependsOnValues(config.dynamicHint?.dependsOn ?? [], namePrefix)
  const resolvedHint = resolveFieldHint(config, hintValues)

  const optionAvailability =
    config.type === 'chips' || config.type === 'select' ? config.optionAvailability : undefined
  const optionValues = useDependsOnValues(optionAvailability?.dependsOn ?? [], namePrefix)

  const resolvedSize = resolveInheritedFieldSize({
    explicit: config.size,
    inherited: inheritedSize,
  })
  let renderConfig: FieldConfig = { ...config, size: resolvedSize }
  if (resolvedHint !== config.hint) {
    renderConfig = { ...renderConfig, hint: resolvedHint }
  }
  if (optionAvailability && (config.type === 'chips' || config.type === 'select')) {
    const options =
      config.type === 'chips'
        ? applyOptionAvailabilityToFieldOptions(config.options, optionAvailability, optionValues)
        : applyOptionAvailabilityToSelectOptions(config.options, optionAvailability, optionValues)
    renderConfig = { ...renderConfig, options } as FieldConfig
  }

  if (renderConfig.type === 'inputSelect') {
    return (
      <InputSelectFieldRenderer
        config={renderConfig}
        fullName={fullName}
        id={id}
        namePrefix={namePrefix}
      />
    )
  }

  if (renderConfig.type === 'inputUnit') {
    return <InputUnitFieldRenderer config={renderConfig} id={id} namePrefix={namePrefix} />
  }

  if (renderConfig.type === 'levelRange') {
    return <LevelRangeFieldRenderer config={renderConfig} id={id} namePrefix={namePrefix} />
  }

  if (renderConfig.type === 'inlineChooseCount') {
    return (
      <InlineSentenceFieldRenderer
        config={inlineChooseCountToInlineSentence(renderConfig)}
        id={id}
        namePrefix={namePrefix}
      />
    )
  }

  if (renderConfig.type === 'chooseFromChips') {
    return (
      <InlineSentenceFieldRenderer
        config={chooseFromChipsToInlineSentence(renderConfig)}
        id={id}
        namePrefix={namePrefix}
      />
    )
  }

  if (renderConfig.type === 'inlineSentence') {
    return <InlineSentenceFieldRenderer config={renderConfig} id={id} namePrefix={namePrefix} />
  }

  return (
    <StandardFieldRenderer
      config={config}
      renderConfig={renderConfig as StandardFieldConfig}
      fullName={fullName}
      id={id}
      namePrefix={namePrefix}
    />
  )
}

type StandardFieldConfig = Exclude<
  FieldConfig,
  | InputSelectFieldConfig
  | LevelRangeFieldConfig
  | InlineSentenceFieldConfig
  | InlineChooseCountFieldConfig
  | ChooseFromChipsFieldConfig
  | InputUnitFieldConfig
>

interface StandardFieldRendererProps {
  config: FieldConfig
  renderConfig: StandardFieldConfig
  fullName: string
  id: string
  namePrefix?: string
}

function StandardFieldRenderer({
  config,
  renderConfig,
  fullName,
  id,
  namePrefix,
}: StandardFieldRendererProps) {
  const { getFieldState } = useFormContext()
  const { field, fieldState } = useController({
    name: fullName,
    defaultValue: fieldDefaultValue(config),
  })
  const formState = useFormState({ name: fullName, exact: true })
  const { errors } = useFormState()
  const liveError = getFieldState(fullName, formState).error
  const remotePreview = useFileFieldRemotePreview(config.name)
  const validation = useFieldErrorPresentation(
    liveError?.message ??
      fieldState.error?.message ??
      resolveNestedFieldErrorMessage(errors, fullName),
    fullName,
  )
  // The registry is keyed by the literal type; TS can't prove the union element
  // matches a single entry, so widen the call signature at this one boundary.
  const render = fieldRenderers[renderConfig.type] as (
    args: RenderArgs<FieldType>,
  ) => React.ReactElement
  return render({
    config: renderConfig,
    field,
    id,
    ...validation,
    remotePreview,
    namePrefix,
  })
}
