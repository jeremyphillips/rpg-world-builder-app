'use client'

import * as React from 'react'
import type { ControllerRenderProps } from 'react-hook-form'

import { ChipsField } from '../../components/ui/chips-field.client'
import { FormField } from '../../components/ui/form-field'
import { NumberField } from '../../components/ui/number-field'
import { NumberStepper } from '../../components/ui/number-stepper.client'
import { resolveNumberStepperSizeFromFieldSize } from '../../components/ui/number-stepper.variants'
import { RadioCardField } from '../../components/ui/radio-card-field'
import { RadioGroupField } from '../../components/ui/radio-group-field'
import { SegmentedControlField } from '../../components/ui/segmented-control-field.client'
import { SwitchField } from '../../components/ui/switch-field'
import { TextareaField } from '../../components/ui/textarea-field'
import { TextField } from '../../components/ui/text-field'
import { MarkdownField } from '../../components/ui/markdown-field.client'
import type { FieldHintPosition } from '../../components/ui/field.variants'
import type { FieldSize } from '../../components/ui/field.client'
import type { JsonFieldProps } from '../../components/ui/json-field.client'
import type { FileFieldProps } from '../../components/ui/file-field.client'
import type { FieldValidationProps } from '../../components/ui/field-validation-props'
import {
  fieldDefaultValue,
  type FieldConfig,
  type FieldType,
  type FileFieldRemotePreview,
} from '../field-config'
import type { FieldLabelVisibility } from '../form-heading.lib'
import { SingleCheckboxFieldRenderer } from './fields/single-checkbox-field-renderer.client'
import { ComboboxFieldRenderer } from './fields/combobox/combobox-field-renderer.client'
import { DiceFormulaFieldRenderer } from './fields/dice-formula-field-renderer.client'
import type { EditableGridFieldRendererProps } from './fields/editable-grid-field-renderer.client'
import { LazyRichTextField } from './fields/lazy-rich-text-field.client'
import { LazyFieldSuspense, lazyFieldComponent } from './lazy-field.client'
import { buildFieldShellProps, type FieldShellOptions } from './field-shell-props.lib'
import type { StandardRegistryType } from './field-renderer-families.lib'

const LazyJsonField = lazyFieldComponent<JsonFieldProps>(
  () => import('../../components/ui/json-field.client'),
  'JsonField',
)
const LazyFileField = lazyFieldComponent<FileFieldProps>(
  () => import('../../components/ui/file-field.client'),
  'FileField',
)
const LazyEditableGridFieldRenderer = lazyFieldComponent<EditableGridFieldRendererProps>(
  () => import('./fields/editable-grid-field-renderer.client'),
  'EditableGridFieldRenderer',
)

/**
 * Steppers with a `defaultValue` keep the numeric fallback. A stepper with no
 * default, such as Base AC, stays blank until the author steps or types a number.
 */
function resolveNumberStepperBinding(
  fieldValue: unknown,
  config: { defaultValue?: number; min?: number },
): { value: number; unbound: boolean } {
  if (typeof fieldValue === 'number') return { value: fieldValue, unbound: false }
  if (config.defaultValue !== undefined) {
    return { value: config.defaultValue ?? config.min ?? 0, unbound: false }
  }
  return { value: 0, unbound: true }
}

function parseNumber(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? undefined : parsed
}

export interface RenderArgs<K extends FieldType> {
  config: Extract<FieldConfig, { type: K }>
  presentationSize: FieldSize
  controlSize: FieldSize
  field: ControllerRenderProps
  id: string
  hint?: string
  hintPosition?: FieldHintPosition
  hintIcon?: 'info'
  labelVisibility: FieldLabelVisibility
  error?: string
  invalid?: boolean
  describedBy?: string
  remotePreview?: FileFieldRemotePreview
  namePrefix?: string
}

function shellFor<K extends FieldType>(
  args: RenderArgs<K>,
  validation: FieldValidationProps,
  options: FieldShellOptions,
) {
  return buildFieldShellProps(
    {
      config: args.config,
      id: args.id,
      hint: args.hint,
      hintPosition: args.hintPosition,
      presentationSize: args.presentationSize,
      controlSize: args.controlSize,
    },
    validation,
    options,
  )
}

const bothSizes: FieldShellOptions = { sizes: 'both', label: 'visible' }

/**
 * Typed adapter registry. A new standard field type fails this map until an entry exists.
 */
export const fieldRenderers: {
  [K in StandardRegistryType]: (args: RenderArgs<K>) => React.ReactElement
} = {
  text: ({ config, field, ...args }) => {
    const {
      hintIcon: _hintIcon,
      labelVisibility: _labelVisibility,
      remotePreview: _remote,
      namePrefix: _prefix,
      ...rest
    } = args
    const validation = { error: rest.error, invalid: rest.invalid, describedBy: rest.describedBy }
    return (
      <TextField
        {...shellFor({ config, field, ...args }, validation, bothSizes)}
        type={config.inputType}
        placeholder={config.placeholder}
        autoComplete={config.autoComplete}
        trailingAction={config.trailingAction}
        ref={field.ref}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
    )
  },
  number: ({ config, field, hintIcon, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return config.control === 'stepper' ? (
      <FormField
        {...shellFor({ config, field, hintIcon, ...args }, validation, bothSizes)}
        labelPosition={config.labelPosition}
        hintIcon={hintIcon}
      >
        <NumberStepper
          id={args.id}
          {...resolveNumberStepperBinding(field.value, config)}
          onChange={field.onChange}
          emptySeed={config.emptySeed}
          min={config.min}
          max={config.max}
          step={config.step}
          digits={config.digits}
          size={resolveNumberStepperSizeFromFieldSize(args.controlSize)}
          disabled={config.disabled}
          stepperLabel={config.label}
          aria-invalid={validation.invalid || undefined}
          onBlur={field.onBlur}
        />
      </FormField>
    ) : (
      <NumberField
        {...shellFor({ config, field, hintIcon, ...args }, validation, bothSizes)}
        inputWidth={config.inputWidth}
        placeholder={config.placeholder}
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
    )
  },
  textarea: ({ config, field, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return (
      <TextareaField
        {...shellFor({ config, field, ...args }, validation, bothSizes)}
        placeholder={config.placeholder}
        rows={config.rows}
        ref={field.ref}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
    )
  },
  segmentedControl: ({ config, field, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return (
      <SegmentedControlField
        {...shellFor({ config, field, ...args }, validation, bothSizes)}
        options={config.options}
        fullWidth={config.fullWidth}
        value={field.value != null && field.value !== '' ? String(field.value) : ''}
        onValueChange={field.onChange}
        onBlur={field.onBlur}
      />
    )
  },
  radio: ({ config, field, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return (
      <RadioGroupField
        {...shellFor({ config, field, ...args }, validation, bothSizes)}
        options={config.options}
        orientation={config.orientation}
        value={field.value ?? ''}
        onValueChange={field.onChange}
        onBlur={field.onBlur}
      />
    )
  },
  radioCard: ({ config, field, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return (
      <RadioCardField
        {...shellFor({ config, field, ...args }, validation, bothSizes)}
        options={config.options}
        value={field.value ?? ''}
        onValueChange={field.onChange}
        onBlur={field.onBlur}
      />
    )
  },
  checkbox: (args) => <SingleCheckboxFieldRenderer {...args} />,
  boolean: (args) => <SingleCheckboxFieldRenderer {...args} />,
  switch: ({ config, field, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return (
      <SwitchField
        {...shellFor({ config, field, ...args }, validation, bothSizes)}
        labelPosition={config.labelPosition}
        checked={field.value ?? false}
        onCheckedChange={field.onChange}
        onBlur={field.onBlur}
      />
    )
  },
  json: ({ config, field, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return (
      <LazyFieldSuspense>
        <LazyJsonField
          {...shellFor({ config, field, ...args }, validation, bothSizes)}
          placeholder={config.placeholder}
          example={config.example}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      </LazyFieldSuspense>
    )
  },
  richtext: ({ config, field, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return (
      <LazyFieldSuspense>
        <LazyRichTextField
          {...shellFor({ config, field, ...args }, validation, bothSizes)}
          linkable={config.linkable}
          codeBlocks={config.codeBlocks}
          tables={config.tables}
          internalLinkOptions={config.internalLinkOptions}
          contentTypeOptions={config.contentTypeOptions}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      </LazyFieldSuspense>
    )
  },
  markdown: ({ config, field, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return (
      <MarkdownField
        {...shellFor({ config, field, ...args }, validation, bothSizes)}
        rows={config.rows}
        placeholder={config.placeholder}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
    )
  },
  file: ({ config, field, remotePreview, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return (
      <LazyFieldSuspense>
        <LazyFileField
          {...shellFor({ config, field, remotePreview, ...args }, validation, {
            sizes: 'presentation',
            label: 'visible',
          })}
          accept={config.accept}
          multiple={config.multiple}
          maxFiles={config.maxFiles}
          maxSize={config.maxSize}
          value={field.value ?? []}
          onChange={field.onChange}
          existingImageUrl={remotePreview?.existingImageUrl}
          existingImageLabel={remotePreview?.existingImageLabel}
          onClearExisting={remotePreview?.onClearExisting}
        />
      </LazyFieldSuspense>
    )
  },
  chips: ({ config, field, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return (
      <ChipsField
        {...shellFor({ config, field, ...args }, validation, bothSizes)}
        introText={config.introText}
        options={config.options ?? []}
        multiple={config.multiple}
        max={config.max}
        chipSize={config.chipSize}
        value={field.value ?? fieldDefaultValue(config)}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
    )
  },
  combobox: ({ config, field, labelVisibility, namePrefix, ...args }) => {
    const validation = { error: args.error, invalid: args.invalid, describedBy: args.describedBy }
    return (
      <ComboboxFieldRenderer
        config={config}
        presentationSize={args.presentationSize}
        controlSize={args.controlSize}
        field={field}
        id={args.id}
        hint={args.hint}
        hintPosition={args.hintPosition}
        labelVisibility={labelVisibility}
        namePrefix={namePrefix}
        {...validation}
      />
    )
  },
  editableGrid: ({ config, field, namePrefix, ...args }) => (
    <LazyFieldSuspense>
      <LazyEditableGridFieldRenderer
        config={config}
        field={field}
        id={args.id}
        error={args.error}
        namePrefix={namePrefix}
      />
    </LazyFieldSuspense>
  ),
  diceFormula: ({ config, field, namePrefix, ...args }) => (
    <DiceFormulaFieldRenderer
      config={config}
      field={field}
      id={args.id}
      hint={args.hint}
      hintPosition={args.hintPosition}
      presentationSize={args.presentationSize}
      controlSize={args.controlSize}
      error={args.error}
      namePrefix={namePrefix}
    />
  ),
}
