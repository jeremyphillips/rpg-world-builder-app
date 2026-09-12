export interface NormalizeFieldOrderOptions {
  /** Field id that should land after existing peers sharing the same compare key. */
  appendFieldId?: string
}

/** Computes target positions for a stable key sort with optional append-to-group policy. */
export function computeNormalizedFieldOrder(
  count: number,
  compareIndices: (leftIndex: number, rightIndex: number) => number,
  fieldIdAtIndex: (index: number) => string,
  options?: NormalizeFieldOrderOptions,
): number[] {
  if (count <= 1) return Array.from({ length: count }, (_, index) => index)

  const appendFieldId = options?.appendFieldId
  const indices = Array.from({ length: count }, (_, index) => index)

  indices.sort((leftIndex, rightIndex) => {
    const compareResult = compareIndices(leftIndex, rightIndex)
    if (compareResult !== 0) return compareResult

    const leftAppends = appendFieldId !== undefined && fieldIdAtIndex(leftIndex) === appendFieldId
    const rightAppends = appendFieldId !== undefined && fieldIdAtIndex(rightIndex) === appendFieldId
    if (leftAppends && !rightAppends) return 1
    if (!leftAppends && rightAppends) return -1
    return leftIndex - rightIndex
  })

  return indices
}

/** Applies a target permutation via sequential `move(from, to)` calls (preserves RHF field ids). */
export function applyFieldIndexPermutation(
  move: (from: number, to: number) => void,
  length: number,
  targetOriginalIndices: number[],
): void {
  if (length <= 1) return

  const currentOrder = Array.from({ length }, (_, index) => index)

  for (let targetIndex = 0; targetIndex < length; targetIndex += 1) {
    const desiredOriginalIndex = targetOriginalIndices[targetIndex]
    if (desiredOriginalIndex === undefined) continue
    const currentIndex = currentOrder.indexOf(desiredOriginalIndex)
    if (currentIndex === targetIndex) continue

    move(currentIndex, targetIndex)
    const [moved] = currentOrder.splice(currentIndex, 1)
    if (moved === undefined) continue
    currentOrder.splice(targetIndex, 0, moved)
  }
}
