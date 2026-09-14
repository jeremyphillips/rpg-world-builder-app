'use client'

import * as React from 'react'
import type { ControllerRenderProps } from 'react-hook-form'

import { ComboboxField } from '../../../components/ui/combobox-field.client'
import type { FieldHintPosition } from '../../../components/ui/field.variants'
import type { FieldSize } from '../../../components/ui/field.client'
import type { ComboboxFieldConfig } from '../../field-config'
import { fieldDefaultValue } from '../../field-config'
import type { FieldValidationProps } from '../../../components/ui/field-validation-props'
import { pickFieldChromeProps } from '../../../components/ui/field-chrome.variants'
import { ComboboxFilterSelect } from './combobox-filter-select.client'
import type { ResolveComboboxFilteredOptions } from '../../../components/ui/combobox-field.types'
import {
  composeComboboxResolveFilteredOptions,
  resolveComboboxFilterDefaultValue,
  toComboboxFieldOptions,
  toFieldOptions,
} from './combobox-field-form.lib'

export interface ComboboxFieldRendererProps extends FieldValidationProps {
  config: ComboboxFieldConfig
  controlSize: FieldSize
  field: ControllerRenderProps
  id: string
  hint?: string
  hintPosition?: FieldHintPosition
  labelVisibility?: ComboboxFieldConfig['labelVisibility']
}

/** RHF adapter for `ComboboxField` with optional category filter toolbar support. */
export function ComboboxFieldRenderer({
  config,
  controlSize,
  field,
  id,
  hint,
  hintPosition,
  labelVisibility,
  ...validation
}: ComboboxFieldRendererProps) {
  const comboboxOptions = React.useMemo(
    () => toComboboxFieldOptions(config.options),
    [config.options],
  )
  const [categoryFilter, setCategoryFilter] = React.useState(() =>
    config.filterSelect ? resolveComboboxFilterDefaultValue(config.filterSelect) : undefined,
  )

  const resolveFilteredOptions = React.useMemo((): ResolveComboboxFilteredOptions | undefined => {
    const formResolver = config.filterSelect
      ? composeComboboxResolveFilteredOptions(categoryFilter!, config.resolveFilteredOptions)
      : config.resolveFilteredOptions

    if (!formResolver) return undefined

    return (options, query, selected) =>
      toComboboxFieldOptions(formResolver(toFieldOptions(options), query, selected))
  }, [categoryFilter, config.filterSelect, config.resolveFilteredOptions])

  const filter = config.filterSelect ? (
    <ComboboxFilterSelect
      ariaLabel={config.filterSelect.ariaLabel}
      options={config.filterSelect.options}
      value={categoryFilter!}
      onValueChange={setCategoryFilter}
    />
  ) : undefined

  return (
    <ComboboxField
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      labelVisibility={labelVisibility}
      options={comboboxOptions}
      multiple={config.multiple}
      max={config.max}
      placeholder={config.placeholder}
      {...validation}
      hint={hint}
      hintPosition={hintPosition}
      info={config.info}
      required={config.required}
      width={config.width}
      size={controlSize}
      disabled={config.disabled}
      value={field.value ?? fieldDefaultValue(config)}
      onChange={field.onChange}
      onBlur={field.onBlur}
      renderSelectedItem={config.renderSelectedItem}
      resolveFilteredOptions={resolveFilteredOptions}
      filter={filter}
    />
  )
}
