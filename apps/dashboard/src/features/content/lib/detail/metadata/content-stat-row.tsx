import {
  InfoTooltip,
  MetadataList,
  Text,
  type MetadataListItem,
  type MetadataListSize,
} from '@rpg/ui'

import type { ContentStatRowData } from './content-stat-rows'
import {
  contentStatRowLabelVariants,
  contentStatRowValueVariants,
  type ContentStatRowSize,
} from './content-stat-row.variants'

export type { ContentStatRowSize, ContentStatRowLayout } from './content-stat-row.variants'
export type ContentStatRowProps = Pick<
  ContentStatRowData,
  'label' | 'value' | 'valueContent' | 'info' | 'infoPlacement' | 'infoAriaLabel'
> & {
  size?: ContentStatRowSize
}

function StatRowInfo({
  label,
  info,
  infoAriaLabel,
}: Pick<ContentStatRowProps, 'label' | 'info' | 'infoAriaLabel'>) {
  if (!info) return null

  return <InfoTooltip aria-label={infoAriaLabel ?? `About ${label}`}>{info}</InfoTooltip>
}

/**
 * Reusable label/value row for content detail pages.
 * Used by {@link ContentDetailLayout} hero metadata and custom detail sections.
 *
 * @example
 * <ContentStatRow label="Hit Die" value="d12 per level" />
 */
/** Label + value cells for a shared hero metadata grid (two direct grid children). */
export function ContentStatRowHeroPair({
  label,
  value,
  valueContent,
  info,
  infoPlacement = 'value',
  infoAriaLabel,
  size = 'default',
}: ContentStatRowProps) {
  const infoOnLabel = infoPlacement === 'label'
  const layout = 'hero' as const

  return (
    <>
      <Text
        as="span"
        className={contentStatRowLabelVariants({ size, layout })}
        data-slot="content-stat-row-label"
      >
        {label}
        {infoOnLabel ? (
          <StatRowInfo label={label} info={info} infoAriaLabel={infoAriaLabel} />
        ) : null}
      </Text>
      <Text as="span" className={contentStatRowValueVariants({ size, layout })}>
        {valueContent ?? value}
        {!infoOnLabel ? (
          <StatRowInfo label={label} info={info} infoAriaLabel={infoAriaLabel} />
        ) : null}
      </Text>
    </>
  )
}

function toMetadataListSize(size: ContentStatRowSize): MetadataListSize {
  return size === 'sm' ? 'sm' : 'default'
}

function toMetadataListItem(
  row: Pick<
    ContentStatRowData,
    'id' | 'label' | 'value' | 'valueContent' | 'info' | 'infoPlacement' | 'infoAriaLabel'
  >,
): MetadataListItem {
  const infoOnLabel = row.infoPlacement === 'label'
  const info = row.info ? (
    <StatRowInfo label={row.label} info={row.info} infoAriaLabel={row.infoAriaLabel} />
  ) : null

  return {
    id: row.id ?? row.label,
    label: (
      <>
        {row.label}
        {infoOnLabel ? info : null}
      </>
    ),
    value: (
      <>
        {row.valueContent ?? row.value}
        {!infoOnLabel ? info : null}
      </>
    ),
  }
}

/** Aligned label/value list for stacked content metadata. */
export function ContentStatList({
  rows,
  size = 'default',
}: {
  rows: readonly ContentStatRowData[]
  size?: ContentStatRowSize
}) {
  return <MetadataList size={toMetadataListSize(size)} items={rows.map(toMetadataListItem)} />
}

export function ContentStatRow({
  label,
  value,
  valueContent,
  info,
  infoPlacement = 'value',
  infoAriaLabel,
  size = 'default',
}: ContentStatRowProps) {
  return (
    <ContentStatList
      size={size}
      rows={[{ label, value, valueContent, info, infoPlacement, infoAriaLabel }]}
    />
  )
}
