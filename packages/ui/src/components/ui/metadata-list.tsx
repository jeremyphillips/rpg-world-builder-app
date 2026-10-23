import { Fragment, type ComponentPropsWithoutRef, type ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  metadataListVariants,
  type MetadataListColumnGap,
  type MetadataListEmphasis,
  type MetadataListSize,
  type MetadataListValueTrack,
} from './metadata-list.variants'

export type MetadataListItem = {
  id?: string
  label: ReactNode
  value: ReactNode
}

export type MetadataListProps = {
  items: readonly MetadataListItem[]
  /** Typography and row gap. Does not change column gap. */
  size?: MetadataListSize
  /** Horizontal space between the label and value columns. */
  columnGap?: MetadataListColumnGap
  /** `content` sizes the value column to its text. `fill` gives it the remaining width. */
  valueTrack?: MetadataListValueTrack
  /** Which side carries foreground color and emphasis weight. */
  emphasis?: MetadataListEmphasis
  /** Bottom rule. Default keeps the content-stat list treatment. */
  divider?: boolean
} & Pick<ComponentPropsWithoutRef<'dl'>, 'aria-labelledby'>

/** Stacked content metadata. Labels stay left; values share one start edge. */
export function MetadataList({
  items,
  size = 'default',
  columnGap = 'md',
  valueTrack = 'content',
  emphasis = 'label',
  divider = true,
  'aria-labelledby': ariaLabelledBy,
}: MetadataListProps) {
  if (items.length === 0) return null

  return (
    <dl
      aria-labelledby={ariaLabelledBy}
      className={cn(
        'ui-metadata-list',
        metadataListVariants({ size, columnGap, valueTrack, emphasis, divider }),
      )}
    >
      {items.map((item, index) => (
        <Fragment key={item.id ?? index}>
          <dt className="ui-metadata-list__label">{item.label}</dt>
          <dd className="ui-metadata-list__value">{item.value}</dd>
        </Fragment>
      ))}
    </dl>
  )
}
