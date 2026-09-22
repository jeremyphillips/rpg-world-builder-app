import type { ReactNode } from 'react'

import { DisclosureEntityCard } from '@/features/content/lib/entity/surfaces/cards/disclosure/disclosure-entity-card'
import { projectArrayItemEntitySummary } from '@/features/content/lib/entity/surfaces/cards/disclosure/array-item-entity-summary.lib'
import type { EntityAnatomyTrailing } from '@/features/content/lib/entity/anatomy/entity-anatomy-trailing.types'
import type { EntitySummaryStatusItem } from '@/features/content/lib/entity/summary/entity-summary-status.types'

type CharacterRelationshipEntityCardProps = {
  itemId: string
  heading: ReactNode
  classification?: string
  status?: readonly EntitySummaryStatusItem[]
  headingHref?: string
  toolbarAriaLabel: string
  trailing?: EntityAnatomyTrailing | null
}

/** Grant-aligned entity card for character relationship collections outside RHF arrays. */
export function CharacterRelationshipEntityCard({
  itemId,
  heading,
  classification,
  status,
  headingHref,
  toolbarAriaLabel,
  trailing,
}: CharacterRelationshipEntityCardProps) {
  const headingText = typeof heading === 'string' ? heading : toolbarAriaLabel
  const entity = projectArrayItemEntitySummary({
    header: {
      primary: headingText,
      fallback: headingText,
      ariaLabel: toolbarAriaLabel,
      showDivider: false,
      showFallbackInTitle: false,
      srOnly: false,
    },
    classification,
    status,
  })

  return (
    <DisclosureEntityCard
      itemId={itemId}
      toolbarAriaLabel={toolbarAriaLabel}
      entity={entity}
      headingHref={headingHref}
      trailing={trailing ?? undefined}
      density="compact"
      defaultCollapsed
    >
      <></>
    </DisclosureEntityCard>
  )
}
