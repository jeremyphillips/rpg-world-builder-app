import { comparePickerName, type PickerNameKey } from '@/lib/catalog-picker/compare-picker-name'

/** Name, then id. Shared by location relationship add and the connection modal's place and property sections. */
export function sortLocationConnectionPickerRows<T extends PickerNameKey>(rows: readonly T[]): T[] {
  return rows.toSorted(comparePickerName)
}
