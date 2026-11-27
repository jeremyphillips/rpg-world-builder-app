import type { FieldWidth } from './field-control.variants'

/** Row-scoped intrinsic column: hints/errors wrap inside label∪control width. */
export function resolveFieldAutoRowIntrinsicSizing(
  width: FieldWidth,
  rowParticipation: boolean,
): boolean {
  return rowParticipation && width === 'auto'
}
