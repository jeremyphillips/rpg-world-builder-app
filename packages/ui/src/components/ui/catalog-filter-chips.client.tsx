'use client'

import { ChipsFieldOptions, type ChipSize } from './chips-field.client'
import { Text } from './text'
import { catalogFilterChipsLabelVariants } from './catalog-toolbar.variants'

export type { ChipSize as CatalogFilterChipsSize }

export type CatalogFilterChipsOption = {
  value: string
  label: string
}

type CatalogFilterChipsBaseProps = {
  id: string
  label?: string
  options: readonly CatalogFilterChipsOption[]
  /** Defaults to `md` for toolbar filter chips. */
  chipSize?: ChipSize
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
  const { id, label, options, chipSize = 'md' } = props
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
          chipSize={chipSize}
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
          chipSize={chipSize}
          showSelectedCheckmark={false}
        />
      )}
    </div>
  )
}
