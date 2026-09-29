function isArrayIndex(segment: string): boolean {
  return /^\d+$/.test(segment)
}

function ensureArraySlot(array: unknown[], index: number, nextIsIndex: boolean): unknown[] {
  while (array.length <= index) {
    array.push(nextIsIndex ? [] : {})
  }
  const slot = array[index]
  if (typeof slot !== 'object' || slot === null || Array.isArray(slot)) {
    array[index] = nextIsIndex ? [] : {}
  }
  return array[index] as unknown[]
}

function ensureRecordSlot(
  record: Record<string, unknown>,
  key: string,
  nextIsIndex: boolean,
): Record<string, unknown> | unknown[] {
  const existing = record[key]
  if (nextIsIndex) {
    if (!Array.isArray(existing)) record[key] = []
    return record[key] as unknown[]
  }
  if (typeof existing !== 'object' || existing === null || Array.isArray(existing)) {
    record[key] = {}
  }
  return record[key] as Record<string, unknown>
}

/** Mutates `target` so `path` resolves to `value`, creating arrays/objects as needed. */
export function setNestedFormValue(
  target: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const segments = path.split('.')
  let cursor: Record<string, unknown> | unknown[] = target

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index]!
    const nextIsIndex = isArrayIndex(segments[index + 1]!)

    if (Array.isArray(cursor)) {
      cursor = ensureArraySlot(cursor, Number.parseInt(segment, 10), nextIsIndex)
      continue
    }

    cursor = ensureRecordSlot(cursor, segment, nextIsIndex)
  }

  const leaf = segments.at(-1)!
  if (Array.isArray(cursor)) {
    const arrayIndex = Number.parseInt(leaf, 10)
    while (cursor.length <= arrayIndex) {
      cursor.push(undefined)
    }
    cursor[arrayIndex] = value
  } else {
    cursor[leaf] = value
  }

  return target
}
