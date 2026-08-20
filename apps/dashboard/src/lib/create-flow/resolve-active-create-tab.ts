/** Clamps active tab to an available id so suppressed tabs cannot leave a blank panel. */
export function resolveActiveCreateTabId(
  availableTabIds: readonly string[],
  activeTabId: string | undefined,
  defaultTabId?: string,
): string {
  if (availableTabIds.length === 0) {
    return defaultTabId ?? ''
  }

  if (activeTabId != null && availableTabIds.includes(activeTabId)) {
    return activeTabId
  }

  if (defaultTabId != null && availableTabIds.includes(defaultTabId)) {
    return defaultTabId
  }

  return availableTabIds[0]!
}
