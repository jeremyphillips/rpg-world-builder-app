import * as React from 'react'
import type { ReactElement, ReactNode } from 'react'
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

type EntityCardStaticBase = {
  entity: EntitySummaryModel
  density?: ContentCardDensity
  /** Numeric-only passive scalar aligned with the entity heading row. */
  headingEndValue?: number
}

export type EntityCardStaticInteractiveProps = EntityCardStaticBase & {
  link?: never
  showNavigationChevron?: never
  leading?: EntityAnatomyLeading
  trailing?: EntityAnatomyTrailing
  disabled?: boolean
  /** Intrinsic-width slot immediately after the entity title. */
  headingInline?: ReactNode
}

export type EntityCardStaticNavigableProps = EntityCardStaticBase & {
  link: ReactElement
  showNavigationChevron?: boolean
  leading?: never
  trailing?: never
  disabled?: never
  headingInline?: never
}

export type EntityCardStaticRendererProps =
  | EntityCardStaticInteractiveProps
  | EntityCardStaticNavigableProps

function warnInvalidEntityCardLink(link: ReactElement | undefined) {
  if (process.env.NODE_ENV !== 'development' || link == null) {
    return
  }
  if (!React.isValidElement(link)) {
    console.warn('EntityCard: `link` must be a single React element.')
  }
}

function isNavigableStaticProps(
  props: EntityCardStaticRendererProps,
): props is EntityCardStaticNavigableProps {
  return 'link' in props && props.link != null
}

export function EntityCardStaticRenderer(props: EntityCardStaticRendererProps) {
  const { entity, density, headingEndValue } = props
  const resolvedDensity = density ?? 'comfortable'
  const utilityFieldSize = resolveEntityCardUtilityFieldSize(resolvedDensity)

  if (isNavigableStaticProps(props)) {
    warnInvalidEntityCardLink(props.link)
    const { link, showNavigationChevron } = props

    return (
      <EntityCardFrame
        density={resolvedDensity}
        edges={resolveEntitySurfaceEdges({ leadingUtilityCount: 0 })}
        leadingUtilityCount={0}
        link={link}
        showNavigationChevron={showNavigationChevron}
      >
        <EntityCardUtilityFieldSizeProvider size={utilityFieldSize}>
          <EntityCardContent>
            <EntityAnatomy
              entity={entity}
              density={resolvedDensity}
              headingEndValue={headingEndValue}
            />
          </EntityCardContent>
        </EntityCardUtilityFieldSizeProvider>
      </EntityCardFrame>
    )
  }

  const { leading, trailing, disabled = false, headingInline } = props

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
