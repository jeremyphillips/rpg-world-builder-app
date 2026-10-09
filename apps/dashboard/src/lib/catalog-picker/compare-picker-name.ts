export const pickerNameCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})

export type PickerNameKey = {
  name: string
  /** Stable row id. When either side omits it, equal names compare equal. */
  id?: string
}

function hasStablePickerId(id: string | undefined): id is string {
  return id != null && id.length > 0
}

/**
 * Picker baseline order: name, then stable id, using {@link pickerNameCollator}.
 * The id step is a hidden tie-break. When either row has no stable id, equal names compare
 * equal and duplicate-name order is intentionally unspecified.
 */
export function comparePickerName(left: PickerNameKey, right: PickerNameKey): number {
  const byName = pickerNameCollator.compare(left.name, right.name)
  if (byName !== 0) return byName
  if (!hasStablePickerId(left.id) || !hasStablePickerId(right.id)) return 0
  return pickerNameCollator.compare(left.id, right.id)
}
