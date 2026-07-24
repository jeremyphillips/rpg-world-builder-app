/** HTTP header for duplicate POST idempotency — client sends; API stores replay mapping. */
export const CONTENT_DUPLICATION_IDEMPOTENCY_HEADER = 'Idempotency-Key' as const
