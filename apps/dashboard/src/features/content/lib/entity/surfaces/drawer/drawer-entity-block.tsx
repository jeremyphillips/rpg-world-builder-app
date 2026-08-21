import { cn } from '@rpg/ui'

import { EntityAnatomy } from '../../anatomy/entity-anatomy'
import { projectEntitySummaryModel } from '../../summary/entity-summary-projection.lib'
import type { DrawerEntityBlockModel } from './drawer-entity.types'
import { drawerEntityVariants } from './drawer-entity.variants'

export type DrawerEntityBlockProps = DrawerEntityBlockModel & {
  className?: string
}

const DRAWER_ENTITY_DENSITY = 'compact' as const

export function DrawerEntityBlock({
  heading,
  headingSuffix,
  supportingText,
  href,
  className,
}: DrawerEntityBlockProps) {
  return (
    <div className={cn(drawerEntityVariants(), className)}>
      <EntityAnatomy
        entity={projectEntitySummaryModel({
          heading,
          classification: headingSuffix,
          description: supportingText,
        })}
        headingHref={href}
        density={DRAWER_ENTITY_DENSITY}
      />
    </div>
  )
}
