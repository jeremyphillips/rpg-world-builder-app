import type { NestedCreateHandoffResult } from './relationship-picker-nested-create.types'

export function applyRelationshipPickerNestedCreateHandoff(
  handoff: NestedCreateHandoffResult,
  callbacks: {
    onSelectCreatedOrganization?: (organizationId: string) => void
    onSelectCreatedLocation?: (locationId: string) => void
    onSelectCreatedNpc?: (characterId: string) => void
  },
): void {
  if (handoff.status !== 'selected') {
    return
  }

  if (handoff.organizationId) {
    callbacks.onSelectCreatedOrganization?.(handoff.organizationId)
  }
  if (handoff.locationId) {
    callbacks.onSelectCreatedLocation?.(handoff.locationId)
  }
  if (handoff.characterId) {
    callbacks.onSelectCreatedNpc?.(handoff.characterId)
  }
}
