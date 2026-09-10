/** Id prefix for field controls inside one tab panel — pairs with `buildFieldControlId`. */
export function getTabPanelIdPrefix(formId: string, tabId: string): string {
  return `${formId}-${tabId}`
}

/** Element id for a tab panel region — pairs with segment `aria-controls`. */
export function getTabPanelElementId(formId: string, tabId: string): string {
  return `${formId}-panel-${tabId}`
}
