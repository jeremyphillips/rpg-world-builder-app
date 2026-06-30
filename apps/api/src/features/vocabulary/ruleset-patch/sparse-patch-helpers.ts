import type { SparsePatchUpdateOps } from '../lib/patch-document'

export type MongoUpdateOps = SparsePatchUpdateOps

export function sparseSetOrUnset(
  ops: MongoUpdateOps,
  path: string,
  value: unknown | undefined,
): void {
  if (value !== undefined) {
    ops.$set[path] = value
  } else {
    ops.$unset[path] = 1
  }
}

export function sparseSetIfDiffers<T>(
  ops: MongoUpdateOps,
  path: string,
  value: T | undefined,
  defaultValue: T,
): void {
  sparseSetOrUnset(ops, path, value !== undefined && value !== defaultValue ? value : undefined)
}
