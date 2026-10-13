import type { ReactNode } from 'react'

import { Badge } from '@rpg/ui'
import { FormSectionHeader } from '@rpg/ui/form'

export type EquipmentInventorySectionHeaderProps = {
  title: string
  count?: number
  action?: ReactNode
}

/** Presentation-only inventory section chrome — title, optional count badge, optional action. */
export function EquipmentInventorySectionHeader({
  title,
  count,
  action,
}: EquipmentInventorySectionHeaderProps) {
  const countBadge =
    count !== undefined && count > 0 ? (
      <Badge appearance="soft" tone="neutral" size="sm">
        {count}
      </Badge>
    ) : undefined

  return (
    <FormSectionHeader
      label={title}
      tier="subsection"
      labelPresentation="heading"
      labelAccessory={countBadge}
      action={action}
    />
  )
}
