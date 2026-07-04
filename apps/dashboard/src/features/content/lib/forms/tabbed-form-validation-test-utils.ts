import { expect } from 'vitest'
import type { TabbedFormTab } from '@rpg/ui/form'

export type AssertHeaderOnlyTabsOptions = {
  /** Tab ids that intentionally omit validation wiring (non-form chrome). */
  exemptTabIds?: readonly string[]
}

function isHeaderOnlyTab(tab: TabbedFormTab): boolean {
  return tab.fields.length === 0 && tab.header !== undefined
}

/**
 * Asserts header-only TabbedForm tabs declare `errorPaths` and `resolverFields`
 * so tab badges, footer summary, and tier-1 validation copy stay wired.
 */
export function assertHeaderOnlyTabsHaveValidationWiring(
  tabs: readonly TabbedFormTab[],
  options: AssertHeaderOnlyTabsOptions = {},
): void {
  const exempt = new Set(options.exemptTabIds ?? [])

  for (const tab of tabs) {
    if (exempt.has(tab.id) || tab.skipHeaderOnlyValidationWiring || !isHeaderOnlyTab(tab)) {
      continue
    }

    expect(
      (tab.errorPaths?.length ?? 0) > 0,
      `header-only tab "${tab.label}" (${tab.id}) must declare errorPaths`,
    ).toBe(true)
    expect(
      (tab.resolverFields?.length ?? 0) > 0,
      `header-only tab "${tab.label}" (${tab.id}) must declare resolverFields`,
    ).toBe(true)
  }
}
