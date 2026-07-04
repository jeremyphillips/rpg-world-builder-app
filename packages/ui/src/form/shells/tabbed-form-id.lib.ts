/** Id prefix for field controls inside one tab panel — pairs with `buildFieldControlId`. */
export function getTabPanelIdPrefix(formId: string, tabId: string): string {
  return `${formId}-${tabId}`
}
