import { ROW_TOP_EPSILON_PX } from './stat-row-group-layout.constants'

export type StatRowGroupLayoutBox = {
  offsetTop: number
  offsetLeft: number
  offsetWidth: number
}

/** True when the next group sits to the right on the same row (for trailing dividers). */
export function areStatRowGroupsSideBySide(groups: readonly StatRowGroupLayoutBox[]): boolean[] {
  const dividers: boolean[] = []
  for (let index = 0; index < groups.length - 1; index++) {
    const left = groups[index]
    const right = groups[index + 1]
    if (left === undefined || right === undefined) {
      dividers.push(false)
      continue
    }
    const sameRow = Math.abs(left.offsetTop - right.offsetTop) < ROW_TOP_EPSILON_PX
    const rightIsBeside =
      right.offsetLeft >= left.offsetLeft + left.offsetWidth - ROW_TOP_EPSILON_PX
    dividers.push(sameRow && rightIsBeside)
  }
  return dividers
}
