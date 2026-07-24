'use client'

import { ChipsFieldOptions, type ChipSize } from './chips-field.client'
import { Text } from './text'
import { useOptionalFilterChrome } from '../../filters/filter-chrome.context'
import { resolveFilterChipSize } from '../../filters/filter-presentation.lib'
import type { FilterFieldPresentation } from '../../filters/filter-presentation.lib'
import { cn } from '../../lib/utils'

export type { ChipSize as CatalogFilterChipsSize }

export type CatalogFilterChipsOption = {
  value: string
  label: string
}

type CatalogFilterChipsBaseProps = {
  id: string
  label?: string
  options: readonly CatalogFilterChipsOption[]
  chipSize?: ChipSize
  labelClassName?: string
  shellClassName?: string
  presentation?: Extract<FilterFieldPresentation, { type: 'chips' }>
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

const STANDALONE_LABEL_CLASS = 'text-sm text-muted-foreground'

function resolveCatalogFilterChipsPresentation({
  chipSize,
  labelClassName,
  shellClassName,
  presentation,
  chrome,
}: Pick<
  CatalogFilterChipsProps,
  'chipSize' | 'labelClassName' | 'shellClassName' | 'presentation'
> & {
  chrome: ReturnType<typeof useOptionalFilterChrome>
}) {
  return {
    chipSize:
      chipSize ?? presentation?.chipSize ?? (chrome ? resolveFilterChipSize(chrome.density) : 'md'),
    labelClassName: labelClassName ?? presentation?.labelClassName ?? STANDALONE_LABEL_CLASS,
    shellClassName: cn('flex flex-col', shellClassName ?? presentation?.shellClassName ?? 'gap-2'),
  }
}

export function CatalogFilterChips(props: CatalogFilterChipsProps) {
  const { id, label, options } = props
  const chrome = useOptionalFilterChrome()
  const { chipSize, labelClassName, shellClassName } = resolveCatalogFilterChipsPresentation({
    chipSize: props.chipSize,
    labelClassName: props.labelClassName,
    shellClassName: props.shellClassName,
    presentation: props.presentation,
    chrome,
  })
  const labelId = `${id}-label`

  return (
    <div className={shellClassName}>
      {label ? (
        <Text as="span" id={labelId} className={labelClassName}>
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
