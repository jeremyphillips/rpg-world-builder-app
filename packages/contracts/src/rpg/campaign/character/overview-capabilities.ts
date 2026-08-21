/** Overview table kinds for stored characters — capability SSOT for bulk roster actions. */
export const CHARACTER_OVERVIEW_KINDS = ['npc', 'pc'] as const

export type CharacterOverviewKind = (typeof CHARACTER_OVERVIEW_KINDS)[number]

export type CharacterOverviewCapability = {
  /** Bulk roster status edits from the overview selection model. */
  bulkRosterStatus: boolean
}

export const CHARACTER_OVERVIEW_CAPABILITIES: Record<
  CharacterOverviewKind,
  CharacterOverviewCapability
> = {
  npc: { bulkRosterStatus: true },
  pc: { bulkRosterStatus: false },
}

export function supportsCharacterBulkRosterStatus(kind: CharacterOverviewKind): boolean {
  return CHARACTER_OVERVIEW_CAPABILITIES[kind].bulkRosterStatus
}
