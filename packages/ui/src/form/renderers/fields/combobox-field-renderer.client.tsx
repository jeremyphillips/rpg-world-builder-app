'use client'

import * as React from 'react'
import type { ControllerRenderProps } from 'react-hook-form'

import { ComboboxField } from '../../../components/ui/combobox-field.client'
import type { FieldHintPosition } from '../../../components/ui/field.variants'
import type { FieldSize } from '../../../components/ui/field.client'
import type { ActiveDimensionFilters, ComboboxFieldConfig } from '../../field-config'
import { fieldDefaultValue } from '../../field-config'
import type { FieldValidationProps } from '../../../components/ui/field-validation-props'
import { pickFieldChromeProps } from '../../../components/ui/field-chrome.variants'
import { ComboboxFilterSelect } from './combobox-filter-select.client'
import { ComboboxFilterToolbar } from './combobox-filter-toolbar.client'
import type { ResolveComboboxFilteredOptions } from '../../../components/ui/combobox-field.types'
import {
  composeComboboxResolveFilteredOptions,
  composeComboboxResolveFilteredOptionsFromActive,
  reconcileActiveDimensionFilters,
  resolveComboboxFilterDefaultValue,
  resolveInitialActiveDimensionFilters,
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

function useComboboxDimensionFilters(config: ComboboxFieldConfig) {
  const dimensionConfigs = config.filterSelects ?? []
  const dimensionConfigsKey = React.useMemo(
    () => JSON.stringify(dimensionConfigs),
    [dimensionConfigs],
  )

  const [active, setActive] = React.useState<ActiveDimensionFilters>(() =>
    resolveInitialActiveDimensionFilters(dimensionConfigs),
  )

  React.useEffect(() => {
    setActive((prev) => reconcileActiveDimensionFilters(prev, dimensionConfigs))
  }, [dimensionConfigsKey, dimensionConfigs])

  return { dimensionConfigs, active, setActive }
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
    () => toComboboxFieldOptions(config.options ?? []),
    [config.options],
  )

  const { dimensionConfigs, active, setActive } = useComboboxDimensionFilters(config)

  const [categoryFilter, setCategoryFilter] = React.useState(() =>
    config.filterSelect ? resolveComboboxFilterDefaultValue(config.filterSelect) : undefined,
  )

  const effectiveCategoryFilter = React.useMemo(() => {
    if (!config.filterSelect) return undefined
    const isValid = config.filterSelect.options.some((option) => option.value === categoryFilter)
    if (isValid) return categoryFilter
    return resolveComboboxFilterDefaultValue(config.filterSelect)
  }, [categoryFilter, config.filterSelect])

  const resolveFilteredOptions = React.useMemo((): ResolveComboboxFilteredOptions | undefined => {
    if (dimensionConfigs.length > 0) {
      const formResolver = composeComboboxResolveFilteredOptionsFromActive(
        active,
        config.resolveFilteredOptions,
      )
      return (options, query, selected) =>
        toComboboxFieldOptions(formResolver(toFieldOptions(options), query, selected))
    }

    const formResolver = config.filterSelect
      ? composeComboboxResolveFilteredOptions(
          effectiveCategoryFilter!,
          config.resolveFilteredOptions,
        )
      : config.resolveFilteredOptions

    if (!formResolver) return undefined

    return (options, query, selected) =>
      toComboboxFieldOptions(formResolver(toFieldOptions(options), query, selected))
  }, [
    active,
    dimensionConfigs.length,
    effectiveCategoryFilter,
    config.filterSelect,
    config.resolveFilteredOptions,
  ])

  const filter =
    dimensionConfigs.length > 0 ? (
      <ComboboxFilterToolbar
        dimensionConfigs={dimensionConfigs}
        active={active}
        onActiveChange={setActive}
      />
    ) : config.filterSelect ? (
      <ComboboxFilterSelect
        ariaLabel={config.filterSelect.ariaLabel}
        options={config.filterSelect.options}
        value={effectiveCategoryFilter!}
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
      resolveOptionLabel={config.resolveOptionLabel}
      filter={filter}
      enableSearch={config.enableSearch}
    />
  )
}
