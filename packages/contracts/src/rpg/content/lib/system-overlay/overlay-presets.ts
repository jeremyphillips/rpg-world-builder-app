import type { z } from 'zod'

import { overlayIdentityArray, overlayValueArray } from './annotate'

/** Seed rows cannot be removed; position is author-meaningful. */
export function overlayRestoreIdRows<T extends z.ZodTypeAny>(element: T) {
  return overlayIdentityArray(element, {
    idKey: 'id',
    missingSeedRow: 'restore',
    order: 'authored',
  })
}

/** Seed rows may be removed; position is author-meaningful. */
export function overlayDeleteIdRows<T extends z.ZodTypeAny>(element: T) {
  return overlayIdentityArray(element, {
    idKey: 'id',
    missingSeedRow: 'delete',
    order: 'authored',
  })
}

/** Equipment-style instances keyed by `entryId`. */
export function overlayDeleteEntryIdRows<T extends z.ZodTypeAny>(element: T) {
  return overlayIdentityArray(element, {
    idKey: 'entryId',
    missingSeedRow: 'delete',
    order: 'authored',
  })
}

/** Unordered primitive or slug list. */
export function overlaySlugList<T extends z.ZodTypeAny>(element: T) {
  return overlayValueArray(element, { ordered: false })
}

/** Ordered list where position matters (steps, outcomes, curve rows). */
export function overlayOrderedList<T extends z.ZodTypeAny>(element: T) {
  return overlayValueArray(element, { ordered: true })
}

/** Identity rows where order does not matter (e.g. media images). */
export function overlayImmaterialIdRows<T extends z.ZodTypeAny>(element: T) {
  return overlayIdentityArray(element, {
    idKey: 'id',
    missingSeedRow: 'delete',
    order: 'immaterial',
  })
}
