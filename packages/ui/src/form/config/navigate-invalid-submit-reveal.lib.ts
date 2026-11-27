import { buildFieldControlId } from '../containers/form-conditional.client'
import type { InvalidSubmitNavigation } from '../errors/resolve-invalid-submit-navigation'
import { waitForInvalidSubmitTarget } from './wait-for-invalid-submit-target.lib'
import type { InvalidSubmitFocusFallbacks } from './navigate-invalid-submit-focus.lib'

export function isInvalidSubmitFocusTargetMounted(
  navigation: InvalidSubmitNavigation,
  idPrefix: string,
  fallbacks?: InvalidSubmitFocusFallbacks,
): boolean {
  if (navigation.focusControlId && document.getElementById(navigation.focusControlId)) {
    return true
  }

  const scalarControlId = buildFieldControlId(idPrefix, undefined, navigation.firstIssue.path)
  if (document.getElementById(scalarControlId)) return true

  const itemPrefix = navigation.firstIssue.itemPrefix
  if (itemPrefix && document.querySelector(`[data-array-item-prefix="${itemPrefix}"]`)) {
    return true
  }

  if (fallbacks?.tabPanelSelector && document.querySelector(fallbacks.tabPanelSelector)) {
    return true
  }

  return Boolean(
    fallbacks?.tabTriggerSelector && document.querySelector(fallbacks.tabTriggerSelector),
  )
}

/** Poll for mount readiness within the pilot reveal budget, then run focus. */
export function scheduleInvalidSubmitFocusWithRevealBudget(
  navigation: InvalidSubmitNavigation,
  idPrefix: string,
  focus: () => void,
  fallbacks?: InvalidSubmitFocusFallbacks,
): void {
  void waitForInvalidSubmitTarget(() =>
    isInvalidSubmitFocusTargetMounted(navigation, idPrefix, fallbacks),
  ).then((ready) => {
    if (ready) focus()
    else focus()
  })
}
