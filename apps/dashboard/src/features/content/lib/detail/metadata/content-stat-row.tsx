import { InfoTooltip, Text } from '@rpg/ui'

import type { ContentStatRowData } from './content-stat-rows'
import {
  contentStatRowLabelVariants,
  contentStatRowValueVariants,
  contentStatRowVariants,
  type ContentStatRowLayout,
  type ContentStatRowSize,
} from './content-stat-row.variants'

export type { ContentStatRowSize, ContentStatRowLayout } from './content-stat-row.variants'
export type ContentStatRowProps = Pick<
  ContentStatRowData,
  'label' | 'value' | 'info' | 'infoPlacement' | 'infoAriaLabel'
> & {
  size?: ContentStatRowSize
  layout?: ContentStatRowLayout
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
  info,
  infoPlacement = 'value',
  infoAriaLabel,
  size = 'default',
}: ContentStatRowProps) {
  const infoOnLabel = infoPlacement === 'label'
  const layout = 'hero' as const

  return (
    <>
      <Text as="span" className={contentStatRowLabelVariants({ size, layout })}>
        {label}
        {infoOnLabel ? (
          <StatRowInfo label={label} info={info} infoAriaLabel={infoAriaLabel} />
        ) : null}
      </Text>
      <Text as="span" className={contentStatRowValueVariants({ size, layout })}>
        {value}
        {!infoOnLabel ? (
          <StatRowInfo label={label} info={info} infoAriaLabel={infoAriaLabel} />
        ) : null}
      </Text>
    </>
  )
}

export function ContentStatRow({
  label,
  value,
  info,
  infoPlacement = 'value',
  infoAriaLabel,
  size = 'default',
  layout = 'inline',
}: ContentStatRowProps) {
  const infoOnLabel = infoPlacement === 'label'

  return (
    <Text as="p" className={contentStatRowVariants({ size, layout })}>
      <Text as="span" className={contentStatRowLabelVariants({ size, layout })}>
        {label}
        {infoOnLabel ? (
          <StatRowInfo label={label} info={info} infoAriaLabel={infoAriaLabel} />
        ) : null}
      </Text>
      :{' '}
      <Text as="span" className={contentStatRowValueVariants({ size, layout })}>
        {value}
        {!infoOnLabel ? (
          <StatRowInfo label={label} info={info} infoAriaLabel={infoAriaLabel} />
        ) : null}
      </Text>
    </Text>
  )
}
