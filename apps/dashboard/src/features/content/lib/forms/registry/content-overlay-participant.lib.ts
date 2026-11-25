import type { ContentTypeKey } from '@rpg/contracts'
import type { SystemOverlayParticipantId } from '@rpg/contracts'

const CONTENT_TYPE_TO_OVERLAY_PARTICIPANT: Partial<
  Record<ContentTypeKey, SystemOverlayParticipantId>
> = {
  monsters: 'monsters',
  species: 'species',
  classes: 'classes',
  spells: 'spells',
  equipment: 'equipment',
  feats: 'feats',
  'skill-proficiencies': 'skill-proficiencies',
}

export function overlayParticipantForContentType(
  routeKey: ContentTypeKey,
): SystemOverlayParticipantId | undefined {
  return CONTENT_TYPE_TO_OVERLAY_PARTICIPANT[routeKey]
}
