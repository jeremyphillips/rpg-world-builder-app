import { z, type ZodType, type ZodTypeAny } from 'zod'

/** Meta key on Zod schemas. Only these factories may write it. */
export const OVERLAY_META_SYMBOL = 'overlay' as const

export type OverlayIdentityMeta = {
  kind: 'identity'
  idKey: 'id' | 'entryId'
  missingSeedRow: 'restore' | 'delete'
  order: 'authored' | 'immaterial'
}

export type OverlayValueListMeta = {
  kind: 'value-list'
  ordered: boolean
}

export type OverlayAtomicMeta = {
  kind: 'atomic'
  reason: string
}

export type OverlayCollectionMeta = OverlayIdentityMeta | OverlayValueListMeta

export type OverlayObjectMeta = OverlayAtomicMeta

export type OverlaySchemaMeta = OverlayCollectionMeta | OverlayObjectMeta

function withOverlayMeta<T extends ZodType>(schema: T, overlay: OverlaySchemaMeta): T {
  return schema.meta({ [OVERLAY_META_SYMBOL]: overlay }) as T
}

export type OverlayIdentityOptions = Omit<OverlayIdentityMeta, 'kind'>

/** Identity collection. Annotate the array schema, not the row schema. */
export function overlayIdentityArray<T extends ZodTypeAny>(
  element: T,
  options: OverlayIdentityOptions,
): z.ZodArray<T> {
  return withOverlayMeta(z.array(element), { kind: 'identity', ...options })
}

export type OverlayValueListOptions = {
  ordered?: boolean
}

/** Value collection (unordered unless `ordered` is true). */
export function overlayValueArray<T extends ZodTypeAny>(
  element: T,
  options: OverlayValueListOptions = {},
): z.ZodArray<T> {
  const ordered = options.ordered === true
  return withOverlayMeta(z.array(element), { kind: 'value-list', ordered })
}

/** Whole-object replacement; children are not overlay paths. */
export function overlayAtomic<T extends ZodType>(schema: T, reason: string): T {
  return withOverlayMeta(schema, { kind: 'atomic', reason })
}

type ZodMetaCarrier = {
  meta?: () => Record<string, unknown> | undefined
}

function metaRecord(schema: ZodType): Record<string, unknown> | undefined {
  const record = (schema as unknown as ZodMetaCarrier).meta?.()
  return record && typeof record === 'object' ? record : undefined
}

/** Read overlay meta from the unwrapped schema core (not an optional/default wrapper). */
export function readOverlaySchemaMeta(schema: ZodType): OverlaySchemaMeta | undefined {
  const record = metaRecord(schema)
  if (!record) return undefined
  const overlay = record[OVERLAY_META_SYMBOL]
  if (!overlay || typeof overlay !== 'object') return undefined
  return overlay as OverlaySchemaMeta
}

export function isOverlayCollectionMeta(meta: OverlaySchemaMeta): meta is OverlayCollectionMeta {
  return meta.kind === 'identity' || meta.kind === 'value-list'
}

export function isOverlayAtomicMeta(meta: OverlaySchemaMeta): meta is OverlayAtomicMeta {
  return meta.kind === 'atomic'
}
