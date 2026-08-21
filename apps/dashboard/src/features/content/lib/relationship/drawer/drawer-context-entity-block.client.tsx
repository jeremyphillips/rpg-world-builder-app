'use client'

import { cn } from '@rpg/ui'

import { EntityAnatomy } from '../../entity/anatomy/entity-anatomy.client'
import { projectEntitySummaryModel } from '../../entity/summary/entity-summary-projection.lib'
import type { DrawerContextEntity } from './drawer-context.types'
import { drawerContextEntityVariants } from './drawer-context.variants'

export type DrawerContextEntityBlockProps = DrawerContextEntity & {
  className?: string
}

const DRAWER_CONTEXT_ENTITY_DENSITY = 'compact' as const

export function DrawerContextEntityBlock({
  heading,
  headingSuffix,
  supportingText,
  href,
  className,
}: DrawerContextEntityBlockProps) {
  return (
    <div className={cn(drawerContextEntityVariants(), className)}>
      <EntityAnatomy
        entity={projectEntitySummaryModel({
          heading,
          classification: headingSuffix,
          description: supportingText,
        })}
        headingHref={href}
        density={DRAWER_CONTEXT_ENTITY_DENSITY}
      />
    </div>
  )
}
