import type { CatalogLayer } from '../envelope'

export function isUploadCatalogLayer(catalogLayer: CatalogLayer): boolean {
  return catalogLayer !== 'system'
}
