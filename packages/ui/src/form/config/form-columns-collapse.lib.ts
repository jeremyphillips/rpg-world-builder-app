/** Default collapsed reading order — all of column 1, then column 2, … */
export const DEFAULT_FORM_COLUMNS_COLLAPSE_ORDER = 'columns' as const

/** One field in a columns layout, addressed as `[columnIndex, fieldIndex]`. */
export type FormColumnsCollapseIndex = readonly [column: number, index: number]

/**
 * Collapsed (single-column) reading order for `kind: 'columns'`.
 *
 * - `'columns'` — concatenate stacks left to right (default)
 * - `'interleave'` — zip: `c1[0], c2[0], c1[1], c2[1], …`
 * - tuple list — explicit sequence; every field must appear exactly once
 */
export type FormColumnsCollapseOrder =
  | typeof DEFAULT_FORM_COLUMNS_COLLAPSE_ORDER
  | 'interleave'
  | ReadonlyArray<FormColumnsCollapseIndex>

export type FormColumnsColumnFields<T> = {
  fields: readonly T[]
}

function isTupleCollapseOrder(
  collapseOrder: FormColumnsCollapseOrder,
): collapseOrder is ReadonlyArray<FormColumnsCollapseIndex> {
  return Array.isArray(collapseOrder)
}

/** True when collapsed layout must reorder DOM (not CSS `grid-cols-1` on two stacks). */
export function columnsNeedBreakpointReorder(
  collapseOrder: FormColumnsCollapseOrder | undefined,
): boolean {
  return collapseOrder !== undefined && collapseOrder !== DEFAULT_FORM_COLUMNS_COLLAPSE_ORDER
}

function flattenColumnsInColumnOrder<T>(columns: readonly FormColumnsColumnFields<T>[]): T[] {
  return columns.flatMap((column) => [...column.fields])
}

function flattenColumnsInterleaved<T>(columns: readonly FormColumnsColumnFields<T>[]): T[] {
  const maxLength = Math.max(0, ...columns.map((column) => column.fields.length))
  const items: T[] = []

  for (let index = 0; index < maxLength; index++) {
    for (const column of columns) {
      const item = column.fields[index]
      if (item !== undefined) items.push(item)
    }
  }

  return items
}

function flattenColumnsByTuples<T>(
  columns: readonly FormColumnsColumnFields<T>[],
  tuples: ReadonlyArray<FormColumnsCollapseIndex>,
): T[] {
  const expectedCount = columns.reduce((sum, column) => sum + column.fields.length, 0)
  const seen = new Set<string>()
  const items: T[] = []

  for (const [columnIndex, fieldIndex] of tuples) {
    const item = columns[columnIndex]?.fields[fieldIndex]
    if (item === undefined) {
      throw new Error(
        `columns collapseOrder tuple [${columnIndex}, ${fieldIndex}] is out of range.`,
      )
    }

    const key = `${columnIndex}:${fieldIndex}`
    if (seen.has(key)) {
      throw new Error('columns collapseOrder tuples must list every field exactly once.')
    }
    seen.add(key)
    items.push(item)
  }

  if (items.length !== expectedCount) {
    throw new Error(
      'columns collapseOrder tuples must list every field in every column exactly once.',
    )
  }

  return items
}

/**
 * Flattened field list in collapsed reading order — SSOT for walkers and the
 * narrow-layout renderer when `collapseOrder` is not `'columns'`.
 */
export function resolveColumnsCollapseSequence<T>(
  columns: readonly FormColumnsColumnFields<T>[],
  collapseOrder: FormColumnsCollapseOrder = DEFAULT_FORM_COLUMNS_COLLAPSE_ORDER,
): T[] {
  if (isTupleCollapseOrder(collapseOrder)) {
    return flattenColumnsByTuples(columns, collapseOrder)
  }

  if (collapseOrder === 'interleave') {
    return flattenColumnsInterleaved(columns)
  }

  return flattenColumnsInColumnOrder(columns)
}
