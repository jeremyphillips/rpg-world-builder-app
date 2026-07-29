import type { Comparator } from '../types'

/** Chains comparators left-to-right; returns 0 when all are equal. */
export function chainComparators<T>(...comparators: readonly Comparator<T>[]): Comparator<T> {
  return (left, right) => {
    for (const compare of comparators) {
      const diff = compare(left, right)
      if (diff !== 0) return diff
    }
    return 0
  }
}

export function compareNumberDescending(left: number, right: number): number {
  return right - left
}

export function compareNumberAscending(left: number, right: number): number {
  return left - right
}

export function compareStringAscending(
  left: string,
  right: string,
  collator: Intl.Collator = defaultCollator,
): number {
  return collator.compare(left, right)
}

export function compareStringDescending(
  left: string,
  right: string,
  collator: Intl.Collator = defaultCollator,
): number {
  return collator.compare(right, left)
}

/** Sorts defined values before undefined/null; compares defined pairs with `compareValues`. */
export function compareOptionalLast<T>(
  left: T | null | undefined,
  right: T | null | undefined,
  compareValues: (left: T, right: T) => number,
): number {
  if (left == null && right == null) return 0
  if (left == null) return 1
  if (right == null) return -1
  return compareValues(left, right)
}

const defaultCollator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  numeric: true,
})
