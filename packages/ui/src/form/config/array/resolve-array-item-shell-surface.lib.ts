import {
  DEFAULT_ARRAY_ITEM_SURFACE,
  DEFAULT_FLAT_ARRAY_ITEM_SURFACE,
  DEFAULT_FLAT_NO_HEADER_ARRAY_ITEM_SURFACE,
} from '../../../components/ui/field-dependent.variants'
import type { SurfaceConfig } from '../../../components/ui/visual-vocabulary.types'

/** Resolves shell surface — subtle wash for disclosure headers; faint for flat no-header items. */
export function resolveArrayItemShellSurface(options: {
  explicit?: SurfaceConfig
  collapsible: boolean
  hasItemHeader?: boolean
}): SurfaceConfig {
  if (options.explicit) return options.explicit
  if (options.collapsible) return DEFAULT_ARRAY_ITEM_SURFACE
  if (options.hasItemHeader === false) return DEFAULT_FLAT_NO_HEADER_ARRAY_ITEM_SURFACE
  return DEFAULT_FLAT_ARRAY_ITEM_SURFACE
}
