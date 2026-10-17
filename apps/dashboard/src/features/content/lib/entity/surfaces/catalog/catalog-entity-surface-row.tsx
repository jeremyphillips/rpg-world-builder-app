import { projectEntitySurfaceConfig } from '../entity-surface-projection.lib'
import type { EntitySurfaceConfig } from '../entity-surface.types'
import { CatalogEntityRow, type CatalogEntityRowProps } from './catalog-entity-row'

export type CatalogEntitySurfaceRowProps = Omit<
  Extract<CatalogEntityRowProps, { selection?: undefined }>,
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
    <CatalogEntityRow
      {...rowProps}
      entity={projected.entity}
      trailing={projected.trailing}
      details={projected.details ?? details}
    />
  )
}
