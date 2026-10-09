import { Fragment, type ReactNode } from 'react'

import {
  metadataListLabelVariants,
  metadataListValueVariants,
  metadataListVariants,
  type MetadataListSize,
} from './metadata-list.variants'

export type MetadataListItem = {
  id?: string
  label: ReactNode
  value: ReactNode
}

export type MetadataListProps = {
  items: readonly MetadataListItem[]
  size?: MetadataListSize
}

/** Stacked content metadata. Labels stay left; values share one right edge. */
export function MetadataList({ items, size = 'default' }: MetadataListProps) {
  if (items.length === 0) return null

  return (
    <dl className={metadataListVariants({ size })}>
      {items.map((item, index) => (
        <Fragment key={item.id ?? index}>
          <dt className={metadataListLabelVariants()}>{item.label}</dt>
          <dd className={metadataListValueVariants()}>{item.value}</dd>
        </Fragment>
      ))}
    </dl>
  )
}
