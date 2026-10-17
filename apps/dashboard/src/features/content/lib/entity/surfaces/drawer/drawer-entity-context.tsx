import { EntityAnatomy } from '../../anatomy/entity-anatomy'
import type { EntityAnatomyTrailing } from '../../anatomy/entity-anatomy-trailing.types'
import { projectEntitySurfaceConfig } from '../entity-surface-projection.lib'
import type { EntitySurfaceConfig } from '../entity-surface.types'

export type DrawerEntityContextProps = {
  surface: EntitySurfaceConfig
  /** Domain utilities (steppers, muted labels) — not card inline actions. */
  trailing?: EntityAnatomyTrailing
}

/** Subject identity for drawer header bands — same projection as bordered entity cards. */
export function DrawerEntityContext({ surface, trailing }: DrawerEntityContextProps) {
  const projected = projectEntitySurfaceConfig(surface, 'compact')
  const resolvedTrailing = trailing ?? projected.trailing

  return <EntityAnatomy density="compact" entity={projected.entity} trailing={resolvedTrailing} />
}
