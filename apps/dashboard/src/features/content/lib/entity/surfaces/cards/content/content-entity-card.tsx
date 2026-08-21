import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ContentCardHeadingAction, type ContentCardDensity } from '@rpg/ui'

import { EntityAnatomy } from '../../../anatomy/entity-anatomy'
import type { EntityAnatomyTrailing } from '../../../anatomy/entity-anatomy-trailing.types'
import type { EntitySummaryModel } from '../../../summary/entity-summary.types'
import { EntityCardFrame } from './entity-card-frame'

export type ContentEntityCardProps = {
  entity: EntitySummaryModel
  /** Exactly one leading utility when set — never a multi-control fragment. */
  leading?: ReactNode
  trailing?: EntityAnatomyTrailing
  /** Links the entity heading only — not whole-row/card navigation. */
  headingHref?: string
  density?: ContentCardDensity
  disabled?: boolean
  /** Numeric-only passive scalar aligned with the entity heading row. */
  headingEndValue?: number
}

export function ContentEntityCard({
  entity,
  leading,
  trailing,
  headingHref,
  density,
  disabled = false,
  headingEndValue,
}: ContentEntityCardProps) {
  const resolvedDensity = density ?? 'comfortable'

  return (
    <EntityCardFrame
      density={resolvedDensity}
      disabled={disabled}
      leadingUtilityCount={leading ? 1 : 0}
    >
      <EntityAnatomy
        entity={entity}
        headingHref={headingHref}
        leadingUtilities={leading != null ? [leading] : undefined}
        trailing={trailing}
        density={resolvedDensity}
        headingEndValue={headingEndValue}
      />
    </EntityCardFrame>
  )
}

export function ContentEntityCardViewLink({ href }: { href: string }) {
  return (
    <ContentCardHeadingAction asChild>
      <Link to={href}>View</Link>
    </ContentCardHeadingAction>
  )
}
