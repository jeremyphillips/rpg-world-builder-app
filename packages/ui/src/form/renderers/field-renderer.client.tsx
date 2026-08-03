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
import { SwitchField } from '../../components/ui/switch-field'
import { TextareaField } from '../../components/ui/textarea-field'
import { TextField } from '../../components/ui/text-field'
import { MarkdownField } from '../../components/ui/markdown-field.client'
import { useFileFieldRemotePreview } from '../context/file-field-props.context'
import { useFieldErrorPresentation } from '../context/array-item-presentation.context'
import { resolveNestedFieldErrorMessage } from '../errors/resolve-field-error-message'
import { DiceFormulaFieldRenderer } from './fields/dice-formula-field-renderer.client'
import { buildFieldRendererIds, resolveFieldRenderConfig } from './field-renderer-config.lib'
import { pickFieldChromeProps } from '../../components/ui/field-chrome.variants'
import { normalizeFieldHint } from '../field-config'
import { renderSpecializedField } from './fields/field-renderer-specialized.client'
import { OptionalDisclosureTextareaFieldRenderer } from './fields/optional-disclosure-field-renderer.client'
import { SelectFieldRenderer } from './fields/select-field-renderer.client'
import { TextSuggestionsFieldRenderer } from './fields/text-suggestions-field-renderer.client'
import { LazyFieldSuspense, lazyFieldComponent } from './lazy-field.client'
import type {
  FieldConfig,
  FieldType,
  InputSelectFieldConfig,
  SelectFieldConfig,
  TextSuggestionsFieldConfig,
  InlineSentenceFieldConfig,
  InlineChooseCountFieldConfig,
  ChooseFromChipsFieldConfig,
  InputUnitFieldConfig,
  LevelRangeFieldConfig,
  RollValueFieldConfig,
} from '../field-config'
import { fieldDefaultValue } from '../field-config'
import { assertOptionalDisclosureFieldConfig } from '../config/optional-disclosure-config.lib'
import { useDependsOnValues } from '../config/form-depends-on.client'
import { useFormSectionContext } from '../context/form-section.context'
import type { JsonFieldProps } from '../../components/ui/json-field.client'
import type { RichTextFieldProps } from '../../components/ui/rich-text-field'
import type { FileFieldProps } from '../../components/ui/file-field.client'
import type { EditableGridFieldRendererProps } from './fields/editable-grid-field-renderer.client'

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
  () => import('./fields/editable-grid-field-renderer.client'),
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
  hint?: string
  hintPosition?: import('../../components/ui/field.variants').FieldHintPosition
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
    | 'select'
    | 'levelRange'
    | 'inlineSentence'
    | 'inlineChooseCount'
    | 'chooseFromChips'
    | 'inputUnit'
    | 'rollValue'
    | 'textSuggestions'
  >]: (args: RenderArgs<K>) => React.ReactElement
} = {
  text: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <TextField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      {...fieldValidationProps(validation)}
      hint={hint}
      hintPosition={hintPosition}
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
  number: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <NumberField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      {...fieldValidationProps(validation)}
      hint={hint}
      hintPosition={hintPosition}
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
  textarea: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <TextareaField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      {...fieldValidationProps(validation)}
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
  ),
  radio: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <RadioGroupField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      options={config.options}
      {...fieldValidationProps(validation)}
      hint={hint}
      hintPosition={hintPosition}
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
  radioCard: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <RadioCardField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      options={config.options}
      {...fieldValidationProps(validation)}
      hint={hint}
      hintPosition={hintPosition}
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
  checkbox: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <CheckboxField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      {...fieldValidationProps(validation)}
      hint={hint}
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
  switch: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <SwitchField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      labelPosition={config.labelPosition}
      {...fieldValidationProps(validation)}
      hint={hint}
      hintPosition={hintPosition}
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
  json: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <LazyFieldSuspense>
      <LazyJsonField
        id={id}
        {...pickFieldChromeProps(config)}
        label={config.label}
        {...fieldValidationProps(validation)}
        hint={hint}
        hintPosition={hintPosition}
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
  richtext: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <LazyFieldSuspense>
      <LazyRichTextField
        id={id}
        {...pickFieldChromeProps(config)}
        label={config.label}
        {...fieldValidationProps(validation)}
        hint={hint}
        hintPosition={hintPosition}
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
  markdown: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <MarkdownField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      {...fieldValidationProps(validation)}
      hint={hint}
      hintPosition={hintPosition}
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
  file: ({ config, field, id, hint, hintPosition, remotePreview, ...validation }) => (
    <LazyFieldSuspense>
      <LazyFileField
        id={id}
        {...pickFieldChromeProps(config)}
        label={config.label}
        {...fieldValidationProps(validation)}
        hint={hint}
        hintPosition={hintPosition}
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
  chips: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <ChipsField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      options={config.options}
      multiple={config.multiple}
      max={config.max}
      {...fieldValidationProps(validation)}
      hint={hint}
      hintPosition={hintPosition}
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
  combobox: ({ config, field, id, hint, hintPosition, ...validation }) => (
    <ComboboxField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      options={config.options}
      multiple={config.multiple}
      max={config.max}
      placeholder={config.placeholder}
      {...fieldValidationProps(validation)}
      hint={hint}
      hintPosition={hintPosition}
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
  diceFormula: ({ config, field, id, hint, hintPosition, namePrefix, ...validation }) => (
    <DiceFormulaFieldRenderer
      config={config}
      field={field}
      id={id}
      hint={hint}
      hintPosition={hintPosition}
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
  const { fullName, id } = buildFieldRendererIds(config, idPrefix, namePrefix)

  const hintDependsOn = normalizeFieldHint(config.hint).resolve?.dependsOn ?? []
  const hintValues = useDependsOnValues(hintDependsOn, namePrefix)
  const optionAvailability =
    config.type === 'chips' || config.type === 'select' ? config.optionAvailability : undefined
  const optionValues = useDependsOnValues(optionAvailability?.dependsOn ?? [], namePrefix)
  const resolved = resolveFieldRenderConfig(config, inheritedSize, hintValues, optionValues)

  const specialized = renderSpecializedField({
    renderConfig: resolved.config,
    fullName,
    id,
    namePrefix,
    hint: resolved.hint,
    hintPosition: resolved.hintPosition,
  })
  if (specialized) return specialized

  if (config.type === 'select') {
    return (
      <SelectFieldRenderer config={config} fullName={fullName} id={id} namePrefix={namePrefix} />
    )
  }

  if (config.type === 'textSuggestions') {
    return (
      <TextSuggestionsFieldRenderer
        config={config}
        fullName={fullName}
        id={id}
        namePrefix={namePrefix}
      />
    )
  }

  return (
    <StandardFieldRenderer
      config={config}
      renderConfig={resolved.config as StandardFieldConfig}
      hint={resolved.hint}
      hintPosition={resolved.hintPosition}
      fullName={fullName}
      id={id}
      namePrefix={namePrefix}
    />
  )
}

type StandardFieldConfig = Exclude<
  FieldConfig,
  | InputSelectFieldConfig
  | SelectFieldConfig
  | TextSuggestionsFieldConfig
  | LevelRangeFieldConfig
  | InlineSentenceFieldConfig
  | InlineChooseCountFieldConfig
  | ChooseFromChipsFieldConfig
  | InputUnitFieldConfig
  | RollValueFieldConfig
>

interface StandardFieldRendererProps {
  config: FieldConfig
  renderConfig: StandardFieldConfig
  hint?: string
  hintPosition?: import('../../components/ui/field.variants').FieldHintPosition
  fullName: string
  id: string
  namePrefix?: string
}

function StandardFieldRenderer({
  config,
  renderConfig,
  hint,
  hintPosition,
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
  assertOptionalDisclosureFieldConfig(config)

  if (renderConfig.type === 'textarea' && renderConfig.optionalDisclosure) {
    return (
      <OptionalDisclosureTextareaFieldRenderer
        config={renderConfig}
        disclosure={renderConfig.optionalDisclosure}
        field={field}
        id={id}
        hint={hint}
        hintPosition={hintPosition}
        {...validation}
      />
    )
  }

  // The registry is keyed by the literal type; TS can't prove the union element
  // matches a single entry, so widen the call signature at this one boundary.
  const render = fieldRenderers[renderConfig.type] as (
    args: RenderArgs<FieldType>,
  ) => React.ReactElement
  return render({
    config: renderConfig,
    field,
    id,
    hint,
    hintPosition,
    ...validation,
    remotePreview,
    namePrefix,
  })
}
