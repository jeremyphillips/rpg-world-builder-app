export const CHARACTER_AUTHORING_SURFACES = ['dashboard', 'public'] as const

export type CharacterAuthoringSurface = (typeof CHARACTER_AUTHORING_SURFACES)[number]
