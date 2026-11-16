'use client'

import * as React from 'react'
import type { ControllerRenderProps } from 'react-hook-form'

import { ComboboxField } from '../../../../components/ui/combobox-field.client'
import type { FieldHintPosition } from '../../../../components/ui/field.variants'
import type { FieldSize } from '../../../../components/ui/field.client'
import type {
  ActiveDimensionFilters,
  ComboboxFieldConfig,
  ComboboxFilterDimensionConfig,
} from '../../../field-config'
import { fieldDefaultValue } from '../../../field-config'
import type { FieldValidationProps } from '../../../../components/ui/field-validation-props'
import { buildFieldShellProps } from '../../field-shell-props.lib'
import { resolveFieldLabelVisibility } from '../../../form-heading.lib'
import { ComboboxFilterToolbar } from './combobox-filter-toolbar.client'
import type { ResolveComboboxFilteredOptions } from '../../../../components/ui/combobox-field.types'
import {
  activeDimensionFiltersEqual,
  composeComboboxResolveFilteredOptionsFromActive,
  reconcileActiveDimensionFilters,
  resolveInitialActiveDimensionFilters,
  toComboboxFieldOptions,
  toFieldOptions,
} from './combobox-field-form.lib'
import { useComboboxFieldRecommendation } from './use-combobox-field-recommendation.client'

const EMPTY_FILTER_SELECTS: readonly ComboboxFilterDimensionConfig[] = []

export interface ComboboxFieldRendererProps extends FieldValidationProps {
  config: ComboboxFieldConfig
  presentationSize: FieldSize
  controlSize: FieldSize
  field: ControllerRenderProps
  id: string
  hint?: string
  hintPosition?: FieldHintPosition
  labelVisibility?: ComboboxFieldConfig['labelVisibility']
  namePrefix?: string
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
  const [lastDimensionConfigsKey, setLastDimensionConfigsKey] = React.useState(dimensionConfigsKey)

  if (lastDimensionConfigsKey !== dimensionConfigsKey) {
    setLastDimensionConfigsKey(dimensionConfigsKey)
    const next = reconcileActiveDimensionFilters(active, dimensionConfigs)
    if (!activeDimensionFiltersEqual(active, next)) {
      setActive(next)
    }
  }

  return { dimensionConfigs, active, setActive }
}

/** RHF adapter for `ComboboxField` with optional dimension filter toolbar support. */
export function ComboboxFieldRenderer({
  config,
  presentationSize,
  controlSize,
  field,
  id,
  hint,
  hintPosition,
  namePrefix,
  ...validation
}: ComboboxFieldRendererProps) {
  const recommendation = useComboboxFieldRecommendation(config, namePrefix)

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
      {...buildFieldShellProps(
        {
          config,
          id,
          hint,
          hintPosition,
          presentationSize,
          controlSize,
        },
        validation,
        {
          sizes: 'both',
          label: resolveFieldLabelVisibility(config) === 'srOnly' ? 'accessible-name' : 'visible',
        },
      )}
      options={comboboxOptions}
      multiple={config.multiple}
      max={config.max}
      placeholder={config.placeholder}
      closedPlaceholderIntent={config.closedPlaceholderIntent}
      noun={config.noun}
      searchPlaceholder={config.searchPlaceholder}
      recommendation={recommendation}
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
