export const SCROLL_BOUNDARY_END_TOLERANCE_PX = 1

export type ScrollBoundaryState = {
  showTopShadow: boolean
  showBottomShadow: boolean
}

export function resolveScrollBoundaryState(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
): ScrollBoundaryState {
  const isScrollable = scrollHeight > clientHeight + SCROLL_BOUNDARY_END_TOLERANCE_PX

  if (!isScrollable) {
    return { showTopShadow: false, showBottomShadow: false }
  }

  const atTop = scrollTop <= SCROLL_BOUNDARY_END_TOLERANCE_PX
  const atBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_BOUNDARY_END_TOLERANCE_PX

  return {
    showTopShadow: !atTop,
    showBottomShadow: !atBottom,
  }
}
