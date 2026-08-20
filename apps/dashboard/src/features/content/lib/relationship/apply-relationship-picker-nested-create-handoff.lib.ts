export function applyRelationshipPickerNestedCreateHandoff(
  handoff: { organizationId?: string; locationId?: string; characterId?: string },
  callbacks: {
    onSelectCreatedOrganization?: (organizationId: string) => void
    onSelectCreatedLocation?: (locationId: string) => void
    onSelectCreatedNpc?: (characterId: string) => void
  },
): void {
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
