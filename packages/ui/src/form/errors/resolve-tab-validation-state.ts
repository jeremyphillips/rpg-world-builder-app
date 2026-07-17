import { sortFormIssues } from './group-form-issues'
import { collectArraySections } from './resolve-field-order'
import type { FormIssue } from './form-issue.types'
import type { FormItem } from '../field-config'
import { isContainer } from '../field-config'

/** Minimal tab shape for path ownership — avoids shell import cycles. */
export type TabValidationTab = {
  id: string
  fields: FormItem[]
  errorPaths?: string[]
}

export type TabValidationState = {
  tabId: string
  count: number
  firstIssuePath?: string
  issues: FormIssue[]
}

/** Whether `prefix` owns validation issues at `path` (segment-boundary safe). */
export function pathOwnsIssue(prefix: string, path: string): boolean {
  return path === prefix || path.startsWith(`${prefix}.`)
}

function collectPrefixesFromItems(items: readonly FormItem[], prefixes: string[]): void {
  for (const item of items) {
    if (!isContainer(item)) {
      prefixes.push(item.name)
      continue
    }

    if (item.kind === 'array' || item.kind === 'slot') {
      prefixes.push(item.name)
      continue
    }

    if (item.kind === 'dependent') {
      prefixes.push(item.controller.name)
      collectPrefixesFromItems(item.dependents.fields, prefixes)
      continue
    }

    collectPrefixesFromItems(item.fields, prefixes)
  }
}

/** Walks a tab's field tree and merges optional `errorPaths` supplements. */
export function collectTabPathPrefixes(tab: TabValidationTab): string[] {
  const prefixes: string[] = []
  collectPrefixesFromItems(tab.fields, prefixes)
  if (tab.errorPaths) {
    prefixes.push(...tab.errorPaths)
  }
  return prefixes
}

function buildTabPrefixesMap(tabs: readonly TabValidationTab[]): Map<string, string[]> {
  return new Map(tabs.map((tab) => [tab.id, collectTabPathPrefixes(tab)]))
}

function findOwningTabId(
  path: string,
  tabs: readonly TabValidationTab[],
  tabPrefixes: Map<string, string[]>,
): string | undefined {
  let bestTabId: string | undefined
  let bestPrefixLength = -1
  let bestTabIndex = Number.POSITIVE_INFINITY

  for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
    const tab = tabs[tabIndex]!
    const prefixes = tabPrefixes.get(tab.id) ?? []

    for (const prefix of prefixes) {
      if (!pathOwnsIssue(prefix, path)) continue

      if (
        prefix.length > bestPrefixLength ||
        (prefix.length === bestPrefixLength && tabIndex < bestTabIndex)
      ) {
        bestPrefixLength = prefix.length
        bestTabIndex = tabIndex
        bestTabId = tab.id
      }
    }
  }

  return bestTabId
}

function sortIssuesForTab(issues: FormIssue[], fields: FormItem[]): FormIssue[] {
  const sections = collectArraySections(fields)
  return sortFormIssues(issues, sections)
}

/** Maps flattened form issues to per-tab validation state (one owner per issue). */
export function resolveTabValidationState(
  issues: readonly FormIssue[],
  tabs: readonly TabValidationTab[],
  fields: FormItem[],
): TabValidationState[] {
  const tabPrefixes = buildTabPrefixesMap(tabs)
  const issuesByTab = new Map<string, FormIssue[]>()

  for (const tab of tabs) {
    issuesByTab.set(tab.id, [])
  }

  for (const issue of issues) {
    const tabId = findOwningTabId(issue.path, tabs, tabPrefixes)
    if (!tabId) continue
    issuesByTab.get(tabId)?.push(issue)
  }

  return tabs.map((tab) => {
    const tabIssues = issuesByTab.get(tab.id) ?? []
    const sorted = sortIssuesForTab(tabIssues, fields)
    return {
      tabId: tab.id,
      count: sorted.length,
      firstIssuePath: sorted[0]?.path,
      issues: sorted,
    }
  })
}

/** Tab id for the first invalid issue — aligned with submit-navigation sort order. */
export function getFirstInvalidTabId(
  issues: readonly FormIssue[],
  tabs: readonly TabValidationTab[],
  fields: FormItem[],
): string | undefined {
  if (issues.length === 0) return undefined

  const sorted = sortIssuesForTab([...issues], fields)
  const firstIssue = sorted[0]
  if (!firstIssue) return undefined

  const tabPrefixes = buildTabPrefixesMap(tabs)
  return findOwningTabId(firstIssue.path, tabs, tabPrefixes)
}
