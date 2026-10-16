import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ContentCardHeadingAction, type ContentCardDensity } from '@rpg/ui'

import { EntityAnatomy } from '../../../anatomy/entity-anatomy'
import type { EntityAnatomyTrailing } from '../../../anatomy/entity-anatomy-trailing.types'
import { resolveEntitySurfaceEdges } from '../../../anatomy/entity-surface-edges.lib'
import type { EntitySummaryModel } from '../../../summary/entity-summary.types'
import { EntityCardContent } from './entity-card-content'
import { EntityCardFrame } from './entity-card-frame'
import {
  EntityCardUtilityFieldSizeProvider,
  resolveEntityCardUtilityFieldSize,
} from './entity-card-utility-field-size.context'

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
  /** Intrinsic-width slot immediately after the entity title. */
  headingInline?: ReactNode
}

export function ContentEntityCard({
  entity,
  leading,
  trailing,
  headingHref,
  density,
  disabled = false,
  headingEndValue,
  headingInline,
}: ContentEntityCardProps) {
  const resolvedDensity = density ?? 'comfortable'
  const utilityFieldSize = resolveEntityCardUtilityFieldSize(resolvedDensity)

  return (
    <EntityCardFrame
      density={resolvedDensity}
      disabled={disabled}
      edges={resolveEntitySurfaceEdges({ leadingUtilityCount: leading ? 1 : 0, trailing })}
      surface="card"
    >
      <EntityCardUtilityFieldSizeProvider size={utilityFieldSize}>
        <EntityCardContent density={resolvedDensity}>
          <EntityAnatomy
            entity={entity}
            headingHref={headingHref}
            leadingUtilities={leading != null ? [leading] : undefined}
            trailing={trailing}
            density={resolvedDensity}
            headingEndValue={headingEndValue}
            headingInline={headingInline}
          />
        </EntityCardContent>
      </EntityCardUtilityFieldSizeProvider>
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
