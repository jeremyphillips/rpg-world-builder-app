export const CHARACTER_KINDS = ['pc', 'npc'] as const

export type CharacterKind = (typeof CHARACTER_KINDS)[number]
