import { contentIdentityIcon, type IconName } from '@rpg/ui'

import type { ConnectionTopLevelSectionId } from './connection-section-catalog'

export const CONNECTION_SECTION_ICONS: Record<ConnectionTopLevelSectionId, IconName> = {
  people: contentIdentityIcon('character'),
  organizations: contentIdentityIcon('organization'),
  places: contentIdentityIcon('location'),
  property: 'house',
}

export function getConnectionSectionIcon(sectionId: ConnectionTopLevelSectionId): IconName {
  return CONNECTION_SECTION_ICONS[sectionId]
}
