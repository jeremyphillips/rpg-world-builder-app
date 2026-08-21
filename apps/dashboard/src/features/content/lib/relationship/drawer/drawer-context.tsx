import { cn } from '@rpg/ui'

import { DrawerEntityBlock } from '../../entity/surfaces/drawer/drawer-entity-block'
import type { DrawerContextProps } from './drawer-context.types'
import { drawerContextVariants } from './drawer-context.variants'

export function DrawerContext({ entities, className }: DrawerContextProps) {
  if (entities.length === 0) {
    return null
  }

  return (
    <div className={cn(drawerContextVariants(), className)}>
      {entities.map((entity, index) => (
        <DrawerEntityBlock key={`${String(entity.heading)}-${index}`} {...entity} />
      ))}
    </div>
  )
}
