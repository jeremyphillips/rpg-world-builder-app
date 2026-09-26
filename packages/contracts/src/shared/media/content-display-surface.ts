export const CONTENT_DISPLAY_SURFACES = ['compact', 'detail', 'field'] as const

export type ContentDisplaySurface = (typeof CONTENT_DISPLAY_SURFACES)[number]
