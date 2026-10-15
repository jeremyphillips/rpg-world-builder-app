'use client'

import * as React from 'react'
import type { ControllerRenderProps } from 'react-hook-form'

import { ComboboxField } from '../../../components/ui/combobox-field.client'
import type { FieldHintPosition } from '../../../components/ui/field.variants'
import type { FieldSize } from '../../../components/ui/field.client'
import type {
  ActiveDimensionFilters,
  ComboboxFieldConfig,
  ComboboxFilterDimensionConfig,
} from '../../field-config'
import { fieldDefaultValue } from '../../field-config'
import type { FieldValidationProps } from '../../../components/ui/field-validation-props'
import { pickFieldChromeProps } from '../../../components/ui/field-chrome.variants'
import { ComboboxFilterToolbar } from './combobox-filter-toolbar.client'
import type { ResolveComboboxFilteredOptions } from '../../../components/ui/combobox-field.types'
import {
  activeDimensionFiltersEqual,
  composeComboboxResolveFilteredOptionsFromActive,
  reconcileActiveDimensionFilters,
  resolveInitialActiveDimensionFilters,
  toComboboxFieldOptions,
  toFieldOptions,
} from './combobox-field-form.lib'

const EMPTY_FILTER_SELECTS: readonly ComboboxFilterDimensionConfig[] = []

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
  const dimensionConfigsKey = React.useMemo(
    () => JSON.stringify(config.filterSelects ?? EMPTY_FILTER_SELECTS),
    [config.filterSelects],
  )
  const dimensionConfigs = React.useMemo(
    () => config.filterSelects ?? EMPTY_FILTER_SELECTS,
    [dimensionConfigsKey],
  )

  const [active, setActive] = React.useState<ActiveDimensionFilters>(() =>
    resolveInitialActiveDimensionFilters(dimensionConfigs),
  )

  React.useEffect(() => {
    setActive((prev) => {
      const next = reconcileActiveDimensionFilters(prev, dimensionConfigs)
      return activeDimensionFiltersEqual(prev, next) ? prev : next
    })
  }, [dimensionConfigsKey, dimensionConfigs])

  return { dimensionConfigs, active, setActive }
}

/** RHF adapter for `ComboboxField` with optional dimension filter toolbar support. */
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

  const resolveFilteredOptions = React.useMemo((): ResolveComboboxFilteredOptions | undefined => {
    if (dimensionConfigs.length === 0) {
      if (!config.resolveFilteredOptions) return undefined
      return (options, query, selected) =>
        toComboboxFieldOptions(
          config.resolveFilteredOptions!(toFieldOptions(options), query, selected),
        )
    }

    const formResolver = composeComboboxResolveFilteredOptionsFromActive(
      active,
      config.resolveFilteredOptions,
    )
    return (options, query, selected) =>
      toComboboxFieldOptions(formResolver(toFieldOptions(options), query, selected))
  }, [active, dimensionConfigs.length, config.resolveFilteredOptions])

  const filter =
    dimensionConfigs.length > 0 ? (
      <ComboboxFilterToolbar
        dimensionConfigs={dimensionConfigs}
        active={active}
        onActiveChange={setActive}
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
