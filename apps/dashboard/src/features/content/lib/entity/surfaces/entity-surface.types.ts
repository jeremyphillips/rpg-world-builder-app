import type { ReactNode } from 'react'

import type {
  EntitySurfaceIdentity,
  EntitySurfaceInlineAction,
} from '../summary/entity-surface-identity.types'

/** Config for CatalogCard and EntityCard compact identity projection. */
export type EntitySurfaceConfig = {
  identity: EntitySurfaceIdentity
  details?: ReactNode
  inlineAction?: EntitySurfaceInlineAction
}
