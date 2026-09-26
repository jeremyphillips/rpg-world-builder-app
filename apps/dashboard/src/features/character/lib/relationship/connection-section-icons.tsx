import { House } from 'lucide-react'
import { contentIdentityIcon, type AppIcon } from '@rpg/ui'

import type { ConnectionTopLevelSectionId } from './connection-section-catalog'

export const CONNECTION_SECTION_ICONS: Record<ConnectionTopLevelSectionId, AppIcon> = {
  people: contentIdentityIcon('character'),
  organizations: contentIdentityIcon('organization'),
  places: contentIdentityIcon('location'),
  property: House,
}

export function getConnectionSectionIcon(sectionId: ConnectionTopLevelSectionId): AppIcon {
  return CONNECTION_SECTION_ICONS[sectionId]
}
