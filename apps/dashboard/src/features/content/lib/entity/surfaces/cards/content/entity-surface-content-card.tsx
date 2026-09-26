import type { ContentCardDensity } from '@rpg/ui'

import { projectEntitySurfaceConfig } from '../../entity-surface-projection.lib'
import type { EntitySurfaceConfig } from '../../entity-surface.types'
import { ContentEntityCard, type ContentEntityCardProps } from './content-entity-card'

export type EntitySurfaceContentCardProps = Omit<ContentEntityCardProps, 'entity' | 'trailing'> & {
  surface: EntitySurfaceConfig
  density?: ContentCardDensity
}

export function EntitySurfaceContentCard({
  surface,
  density = 'compact',
  ...cardProps
}: EntitySurfaceContentCardProps) {
  const projected = projectEntitySurfaceConfig(surface, density)

  return (
    <ContentEntityCard
      {...cardProps}
      density={density}
      entity={projected.entity}
      trailing={projected.trailing}
    />
  )
}
