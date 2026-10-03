/** Default host column vocabulary — hosts may declare more (e.g. `media`) via the generic. */
export type RowColumn = 'leading' | 'content' | 'trailing'

/** Columns that may hold secondary rows (meta/status) — rails never stack under the band. */
export type RowAnatomySecondaryColumn = 'content' | 'trailing'

export type RowAnatomyBand = 'control' | 'media-xs' | 'media-sm'

export type RowAnatomySlot = 'band' | 'meta' | 'status' | 'full' | 'stretch'

/**
 * Discriminated cell placement. `column` is a host-declared grid line name;
 * the slot fixes the row placement and vertical self-alignment.
 */
export type RowAnatomyCellSpec<C extends string = RowColumn> =
  | { slot: 'band'; column: C }
  | { slot: 'meta'; column: RowAnatomySecondaryColumn }
  | { slot: 'status'; column: RowAnatomySecondaryColumn }
  | { slot: 'full'; column: C }
  | { slot: 'stretch'; column: 'trailing' }
