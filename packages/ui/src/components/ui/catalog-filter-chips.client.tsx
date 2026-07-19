'use client'

import { ChipsFieldOptions } from './chips-field.client'
import { Text } from './text'
import { catalogFilterChipsLabelVariants } from './catalog-toolbar.variants'

export type CatalogFilterChipsOption = {
  value: string
  label: string
}

type CatalogFilterChipsBaseProps = {
  id: string
  label?: string
  options: readonly CatalogFilterChipsOption[]
}

type CatalogFilterChipsSingleRequiredProps = CatalogFilterChipsBaseProps & {
  selectionMode: 'single-required'
  value: string
  onValueChange: (value: string) => void
}

type CatalogFilterChipsMultipleProps = CatalogFilterChipsBaseProps & {
  selectionMode?: 'multiple'
  selectedValues: readonly string[]
  onSelectedValuesChange: (values: string[]) => void
}

export type CatalogFilterChipsProps =
  | CatalogFilterChipsSingleRequiredProps
  | CatalogFilterChipsMultipleProps

export function CatalogFilterChips(props: CatalogFilterChipsProps) {
  const { id, label, options } = props
  const labelId = `${id}-label`

  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <Text as="span" id={labelId} className={catalogFilterChipsLabelVariants()}>
          {label}
        </Text>
      ) : (
        <span id={labelId} className="sr-only">
          Filter options
        </span>
      )}
      {props.selectionMode === 'single-required' ? (
        <ChipsFieldOptions
          id={id}
          labelledBy={labelId}
          options={[...options]}
          multiple={false}
          value={props.value}
          onChange={(value) => {
            if (value != null && value !== '') {
              props.onValueChange(String(value))
            }
          }}
          chipSize="sm"
          showSelectedCheckmark={false}
        />
      ) : (
        <ChipsFieldOptions
          id={id}
          labelledBy={labelId}
          options={[...options]}
          multiple
          value={[...props.selectedValues]}
          onChange={(value) =>
            props.onSelectedValuesChange(Array.isArray(value) ? value.map(String) : [])
          }
          chipSize="sm"
          showSelectedCheckmark={false}
        />
      )}
    </div>
  )
}
