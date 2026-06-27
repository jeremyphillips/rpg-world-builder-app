'use client'

import { InfoTooltip, Text } from '@rpg/ui'

import type { ContentStatRowData } from './content-stat-rows'

export type ContentStatRowProps = Pick<
  ContentStatRowData,
  'label' | 'value' | 'info' | 'infoPlacement' | 'infoAriaLabel'
>

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
export function ContentStatRow({
  label,
  value,
  info,
  infoPlacement = 'value',
  infoAriaLabel,
}: ContentStatRowProps) {
  const infoOnLabel = infoPlacement === 'label'

  return (
    <Text variant="emphasis" as="p">
      <Text variant="emphasis" as="span" className="inline-flex items-center gap-1">
        {label}
        {infoOnLabel ? (
          <StatRowInfo label={label} info={info} infoAriaLabel={infoAriaLabel} />
        ) : null}
      </Text>
      :{' '}
      <Text variant="muted" as="span" className="inline-flex items-center gap-1">
        {value}
        {!infoOnLabel ? (
          <StatRowInfo label={label} info={info} infoAriaLabel={infoAriaLabel} />
        ) : null}
      </Text>
    </Text>
  )
}
