import { projectEntitySurfaceConfig } from '../entity-surface-projection.lib'
import type { EntitySurfaceConfig } from '../entity-surface.types'
import { CatalogCard, type CatalogCardProps } from './catalog-card'

export type CatalogEntitySurfaceRowProps = Omit<
  Extract<CatalogCardProps, { selection?: undefined }>,
  'entity' | 'trailing'
> & {
  surface: EntitySurfaceConfig
}

export function CatalogEntitySurfaceRow({
  surface,
  details,
  ...rowProps
}: CatalogEntitySurfaceRowProps) {
  const projected = projectEntitySurfaceConfig(surface)

  return (
    <CatalogCard
      {...rowProps}
      entity={projected.entity}
      trailing={projected.trailing}
      details={projected.details ?? details}
    />
  )
}
