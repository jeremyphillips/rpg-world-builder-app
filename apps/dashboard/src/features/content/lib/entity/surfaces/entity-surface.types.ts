import type { ReactNode } from 'react'

import type {
  EntitySurfaceIdentity,
  EntitySurfaceInlineAction,
} from '../summary/entity-surface-identity.types'

/** Config for CatalogEntityRow, ContentEntityCard, and DisclosureEntityCard compact identity. */
export type EntitySurfaceConfig = {
  identity: EntitySurfaceIdentity
  details?: ReactNode
  inlineAction?: EntitySurfaceInlineAction
}
