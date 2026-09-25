/** Whether the sticky header has crossed the scrollport top boundary. */
export function computeSheetStickyHeaderStuck(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) return false

  const { rootBounds, boundingClientRect } = entry
  if (!rootBounds) return false

  return boundingClientRect.top < rootBounds.top
}
