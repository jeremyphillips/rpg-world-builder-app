import { Text } from '@rpg/ui'

export type ContentStatRowProps = {
  label: string
  value: string
}

/**
 * Reusable label/value row for content detail pages.
 * Used by content detail routes via {@link ContentDetailStatBody}.
 *
 * @example
 * <ContentStatRow label="Hit Die" value="d12 per level" />
 */
export function ContentStatRow({ label, value }: ContentStatRowProps) {
  return (
    <Text variant="emphasis" as="p">
      {label}:{' '}
      <Text variant="muted" as="span">
        {value}
      </Text>
    </Text>
  )
}
