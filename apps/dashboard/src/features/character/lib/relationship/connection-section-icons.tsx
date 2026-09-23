import { House, Landmark, MapPin, User, type LucideIcon } from 'lucide-react'

import type { ConnectionTopLevelSectionId } from './connection-section-catalog'

export const CONNECTION_SECTION_ICONS: Record<ConnectionTopLevelSectionId, LucideIcon> = {
  people: User,
  organizations: Landmark,
  places: MapPin,
  property: House,
}

export function getConnectionSectionIcon(sectionId: ConnectionTopLevelSectionId): LucideIcon {
  return CONNECTION_SECTION_ICONS[sectionId]
}
