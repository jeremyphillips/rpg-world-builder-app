'use client'

import { InfoTooltip, Text } from '@rpg/ui'

import type { ContentStatRowData } from './content-stat-rows'

export type ContentStatRowProps = Pick<
  ContentStatRowData,
  'label' | 'value' | 'info' | 'infoAriaLabel'
>

/**
 * Reusable label/value row for content detail pages.
 * Used by content detail routes via {@link ContentDetailStatBody}.
 *
 * @example
 * <ContentStatRow label="Hit Die" value="d12 per level" />
 */
export function ContentStatRow({ label, value, info, infoAriaLabel }: ContentStatRowProps) {
  return (
    <Text variant="emphasis" as="p">
      {label}:{' '}
      <Text variant="muted" as="span" className="inline-flex items-center gap-1">
        {value}
        {info ? (
          <InfoTooltip aria-label={infoAriaLabel ?? `About ${label}`}>{info}</InfoTooltip>
        ) : null}
      </Text>
    </Text>
  )
}
