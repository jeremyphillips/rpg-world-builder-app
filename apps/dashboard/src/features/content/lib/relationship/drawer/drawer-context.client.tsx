'use client'

import { cn } from '@rpg/ui'

import { DrawerContextEntityBlock } from './drawer-context-entity-block.client'
import type { DrawerContextEntity } from './drawer-context.types'
import { drawerContextVariants } from './drawer-context.variants'

export type DrawerContextProps = {
  entities: readonly DrawerContextEntity[]
  className?: string
}

export function DrawerContext({ entities, className }: DrawerContextProps) {
  if (entities.length === 0) {
    return null
  }

  return (
    <div className={cn(drawerContextVariants(), className)}>
      {entities.map((entity, index) => (
        <DrawerContextEntityBlock key={`${String(entity.heading)}-${index}`} {...entity} />
      ))}
    </div>
  )
}
