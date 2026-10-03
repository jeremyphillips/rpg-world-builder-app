/** CSS var names — surfaces publish values; anatomy composes formulas from names. */
export const ENTITY_SURFACE_INLINE_START_VAR = '--entity-surface-inline-start'

export const ENTITY_SURFACE_INLINE_END_VAR = '--entity-surface-inline-end'

/** Density base inset (16px compact / 20px comfortable). */
export const ENTITY_SURFACE_INSET_VAR = '--entity-surface-inset'

/** Density utility-edge inset (4px compact / 8px comfortable) — edges holding ghost utilities. */
export const ENTITY_SURFACE_UTILITY_INSET_VAR = '--entity-surface-utility-inset'

export const ENTITY_CONTENT_OFFSET_VAR = '--entity-content-offset'

export const ENTITY_BODY_INLINE_START_VAR = '--entity-body-inline-start'

export const ENTITY_BODY_INLINE_START_VALUE = `calc(var(${ENTITY_SURFACE_INLINE_START_VAR}) + var(${ENTITY_CONTENT_OFFSET_VAR}))`

/** Expanded body end — always the base inset, independent of the header's trailing utility edge. */
export const ENTITY_BODY_INLINE_END_VAR = '--entity-body-inline-end'

export const ENTITY_BODY_INLINE_END_VALUE = `var(${ENTITY_SURFACE_INSET_VAR})`

/** @deprecated Alias during migration — prefer {@link ENTITY_CONTENT_OFFSET_VAR}. */
export const ENTITY_LEADING_OFFSET_VAR = '--entity-leading-offset'

/** @deprecated Alias during migration — prefer {@link ENTITY_CONTENT_OFFSET_VAR}. */
export const ENTITY_CONTENT_INDENT_VAR = '--entity-content-indent'
