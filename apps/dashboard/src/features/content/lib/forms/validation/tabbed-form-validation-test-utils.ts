import { expect } from 'vitest'
import type { TabbedFormTab } from '@rpg/ui/form'
import { isContainer, type FormItem } from '@rpg/ui/form'

export type AssertHeaderOnlyTabsOptions = {
  /** Tab ids that intentionally omit validation wiring (non-form chrome). */
  exemptTabIds?: readonly string[]
}

export type AssertTabErrorPathCoverageOptions = {
  /**
   * Per-tab field paths that must be declared on `errorPaths` and mirrored in
   * `resolverFields` when rendered via slots or other custom tab content.
   */
  slotOwnedPaths?: Readonly<Record<string, readonly string[]>>
}

function isHeaderOnlyTab(tab: TabbedFormTab): boolean {
  return tab.fields.length === 0 && tab.header !== undefined
}

function collectLeafFieldNames(items: readonly FormItem[]): string[] {
  const names: string[] = []

  for (const item of items) {
    if (!isContainer(item)) {
      names.push(item.name)
      continue
    }

    if (item.kind === 'slot' || item.kind === 'array') {
      names.push(item.name)
      continue
    }

    if (item.kind === 'dependent') {
      names.push(item.controller.name)
      names.push(...collectLeafFieldNames(item.dependents.fields))
      continue
    }

    names.push(...collectLeafFieldNames(item.fields))
  }

  return names
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

/**
 * Asserts tabs with slot/custom content declare explicit validation ownership for
 * field paths that automatic tab discovery cannot infer.
 */
export function assertTabErrorPathCoverage(
  tabs: readonly TabbedFormTab[],
  options: AssertTabErrorPathCoverageOptions = {},
): void {
  const slotOwnedPaths = options.slotOwnedPaths ?? {}

  for (const [tabId, requiredPaths] of Object.entries(slotOwnedPaths)) {
    const tab = tabs.find((entry) => entry.id === tabId)
    expect(tab, `tab "${tabId}" not found`).toBeDefined()
    if (!tab) continue

    const errorPaths = tab.errorPaths ?? []
    const resolverFieldNames = collectLeafFieldNames(tab.resolverFields ?? [])

    for (const path of requiredPaths) {
      expect(
        errorPaths.includes(path),
        `tab "${tab.label}" (${tab.id}) must declare errorPaths for "${path}"`,
      ).toBe(true)
      expect(
        resolverFieldNames.includes(path),
        `tab "${tab.label}" (${tab.id}) must declare resolverFields for "${path}"`,
      ).toBe(true)
    }
  }
}
