import type { ReactNode } from 'react'
import { type ContentCardDensity } from '@rpg/ui'

import { EntityAnatomy } from '../../../anatomy/entity-anatomy'
import type { EntityAnatomyLeading } from '../../../anatomy/entity-anatomy-leading.types'
import type { EntityAnatomyTrailing } from '../../../anatomy/entity-anatomy-trailing.types'
import { resolveEntitySurfaceEdges } from '../../../anatomy/entity-surface-edges.lib'
import type { EntitySummaryModel } from '../../../summary/entity-summary.types'
import { EntityCardContent } from './entity-card-content'
import { EntityCardFrame } from './entity-card-frame'
import {
  EntityCardUtilityFieldSizeProvider,
  resolveEntityCardUtilityFieldSize,
} from './entity-card-utility-field-size.context'

export type EntityCardStaticRendererProps = {
  entity: EntitySummaryModel
  leading?: EntityAnatomyLeading
  trailing?: EntityAnatomyTrailing
  density?: ContentCardDensity
  disabled?: boolean
  /** Numeric-only passive scalar aligned with the entity heading row. */
  headingEndValue?: number
  /** Intrinsic-width slot immediately after the entity title. */
  headingInline?: ReactNode
}

export function EntityCardStaticRenderer({
  entity,
  leading,
  trailing,
  density,
  disabled = false,
  headingEndValue,
  headingInline,
}: EntityCardStaticRendererProps) {
  const resolvedDensity = density ?? 'comfortable'
  const utilityFieldSize = resolveEntityCardUtilityFieldSize(resolvedDensity)

  return (
    <EntityCardFrame
      density={resolvedDensity}
      disabled={disabled}
      edges={resolveEntitySurfaceEdges({
        leadingUtilityCount: leading != null ? 1 : 0,
        trailing,
      })}
      leadingUtilityCount={leading != null ? 1 : 0}
    >
      <EntityCardUtilityFieldSizeProvider size={utilityFieldSize}>
        <EntityCardContent>
          <EntityAnatomy
            entity={entity}
            leading={leading}
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
