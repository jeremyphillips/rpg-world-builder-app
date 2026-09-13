/** Whether `element` is not fully visible inside `scrollport` along the block axis. */
export function isElementOutsideScrollport(element: Element, scrollport: Element): boolean {
  const elementRect = element.getBoundingClientRect()
  const scrollportRect = scrollport.getBoundingClientRect()

  return elementRect.top < scrollportRect.top || elementRect.bottom > scrollportRect.bottom
}
