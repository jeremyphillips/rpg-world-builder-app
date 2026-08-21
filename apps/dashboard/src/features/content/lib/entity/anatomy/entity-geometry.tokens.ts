/** CSS var names — surfaces publish values; anatomy composes formulas from names. */
export const ENTITY_SURFACE_INLINE_START_VAR = '--entity-surface-inline-start'

export const ENTITY_SURFACE_INLINE_END_VAR = '--entity-surface-inline-end'

export const ENTITY_CONTENT_OFFSET_VAR = '--entity-content-offset'

export const ENTITY_BODY_INLINE_START_VAR = '--entity-body-inline-start'

export const ENTITY_BODY_INLINE_START_VALUE = `calc(var(${ENTITY_SURFACE_INLINE_START_VAR}) + var(${ENTITY_CONTENT_OFFSET_VAR}))`

/** @deprecated Alias during migration — prefer {@link ENTITY_CONTENT_OFFSET_VAR}. */
export const ENTITY_LEADING_OFFSET_VAR = '--entity-leading-offset'

/** @deprecated Alias during migration — prefer {@link ENTITY_CONTENT_OFFSET_VAR}. */
export const ENTITY_CONTENT_INDENT_VAR = '--entity-content-indent'
