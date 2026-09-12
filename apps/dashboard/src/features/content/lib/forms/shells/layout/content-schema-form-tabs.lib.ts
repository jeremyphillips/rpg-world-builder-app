import type { FormItem, TabbedFormTab } from '@rpg/ui/form'

const HOISTED_NAME_PATH = 'name'

/** Appends hoisted identity `name` ownership to the first tab for tab badges and resolver copy. */
export function augmentTabsWithHoistedName(
  tabs: readonly TabbedFormTab[],
  nameField: FormItem,
): TabbedFormTab[] {
  const firstTab = tabs[0]
  if (!firstTab) return [...tabs]

  const errorPaths = [...new Set([...(firstTab.errorPaths ?? []), HOISTED_NAME_PATH])]
  const resolverFields = [...(firstTab.resolverFields ?? []), nameField]

  return [{ ...firstTab, errorPaths, resolverFields }, ...tabs.slice(1)]
}
