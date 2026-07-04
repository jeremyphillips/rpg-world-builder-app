import { buildFieldControlId } from '../containers/form-conditional.client'
import type { InvalidSubmitNavigation } from '../errors/resolve-invalid-submit-navigation'
import { focusFirstEligibleArrayItemControl } from '../renderers/array-field-item-focus.lib'

export type InvalidSubmitFocusFallbacks = {
  tabPanelSelector?: string
  tabTriggerSelector?: string
}

function scrollElementIntoView(element: Element): void {
  if ('scrollIntoView' in element && typeof element.scrollIntoView === 'function') {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function focusElement(element: Element): boolean {
  scrollElementIntoView(element)
  if ('focus' in element && typeof element.focus === 'function') {
    element.focus({ preventScroll: true })
    return true
  }
  return false
}

function focusElementById(controlId: string): boolean {
  const element = document.getElementById(controlId)
  return element ? focusElement(element) : false
}

function focusArrayItemRow(itemPrefix: string): boolean {
  const rowElement = document.querySelector(`[data-array-item-prefix="${itemPrefix}"]`)
  if (!rowElement) return false

  scrollElementIntoView(rowElement)
  focusFirstEligibleArrayItemControl(rowElement)
  return true
}

function focusSelectorTarget(selector: string | undefined): boolean {
  if (!selector) return false
  const element = document.querySelector(selector)
  return element ? focusElement(element) : false
}

/** Focus/scroll ladder after a failed submit: control → array row → tab panel → tab trigger. */
export function performInvalidSubmitFocus(
  navigation: InvalidSubmitNavigation,
  idPrefix: string,
  fallbacks?: InvalidSubmitFocusFallbacks,
): void {
  if (navigation.focusControlId && focusElementById(navigation.focusControlId)) return

  const scalarControlId = buildFieldControlId(idPrefix, undefined, navigation.firstIssue.path)
  if (focusElementById(scalarControlId)) return

  const itemPrefix = navigation.firstIssue.itemPrefix
  if (itemPrefix && focusArrayItemRow(itemPrefix)) return

  if (focusSelectorTarget(fallbacks?.tabPanelSelector)) return

  focusSelectorTarget(fallbacks?.tabTriggerSelector)
}
