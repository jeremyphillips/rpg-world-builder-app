import type { ContentDisplayFallback, ContentDisplayImage } from '@rpg/contracts'

import type { DrawerEntityPresentation } from '../drawer-entity.types'

export type EntityReplacementCurrentSnapshot = {
  entity: DrawerEntityPresentation
  displayImage?: ContentDisplayImage
  fallback?: ContentDisplayFallback
  unavailable?: boolean
}
