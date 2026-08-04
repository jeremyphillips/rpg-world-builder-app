import { z } from 'zod'

/** Minimal paginated list envelope for content-reference hits and similar reads. */
export function paginatedItemsSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
  })
}

export type PaginatedItems<T> = {
  items: T[]
  total: number
}
