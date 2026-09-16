import {
  DEFAULT_ARRAY_ITEM_SURFACE,
  DEFAULT_FLAT_ARRAY_ITEM_SURFACE,
} from '../../../components/ui/field-dependent.variants'
import type { SurfaceConfig } from '../../../components/ui/visual-vocabulary.types'

/** Resolves shell surface — flat canvas for non-collapsible rows; subtle header for disclosure. */
export function resolveArrayItemShellSurface(options: {
  explicit?: SurfaceConfig
  collapsible: boolean
}): SurfaceConfig {
  if (options.explicit) return options.explicit
  return options.collapsible ? DEFAULT_ARRAY_ITEM_SURFACE : DEFAULT_FLAT_ARRAY_ITEM_SURFACE
}
