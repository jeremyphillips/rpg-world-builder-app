import type { ArrayConfig } from '../field-config'
import type { FormIssue } from '../errors/form-issue.types'
import { resolveIssueFocusControlId } from '../errors/resolve-issue-focus-target'

export function scrollArrayItemElementIntoView(element: Element): void {
  if ('scrollIntoView' in element && typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

const ARRAY_ITEM_FOCUSABLE_SELECTOR = [
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button[role="combobox"]:not([disabled])',
].join(', ')

/** Best-effort focus of the first eligible control inside an array item row. */
export function focusFirstEligibleArrayItemControl(container: Element): void {
  const element = container.querySelector(ARRAY_ITEM_FOCUSABLE_SELECTOR)
  if (element && 'focus' in element && typeof element.focus === 'function') {
    element.focus({ preventScroll: true })
  }
}

/** Focuses the control for one issue, or scrolls its array row into view. */
export function focusDomIssueTarget(
  issue: FormIssue,
  idPrefix: string,
  arrayPattern: ArrayConfig['arrayPattern'] | undefined,
  fallbackItemPrefix?: string,
): void {
  window.requestAnimationFrame(() => {
    const focusControlId = resolveIssueFocusControlId(issue, idPrefix, arrayPattern)
    if (focusControlId) {
      const element = document.getElementById(focusControlId)
      if (element) {
        scrollArrayItemElementIntoView(element)
        if ('focus' in element && typeof element.focus === 'function') {
          element.focus({ preventScroll: true })
        }
        return
      }
    }

    const itemPrefix = fallbackItemPrefix ?? issue.itemPrefix
    if (!itemPrefix) return

    const rowElement = document.querySelector(`[data-array-item-prefix="${itemPrefix}"]`)
    if (rowElement) scrollArrayItemElementIntoView(rowElement)
  })
}
