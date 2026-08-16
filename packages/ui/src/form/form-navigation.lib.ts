import type { DependentConfig, FormItem, GroupConfig, RowConfig } from './field-config'
import { resolveGroupHeading, resolveRowHeading } from './resolve-container-heading.lib'

export type CollectedNavigationAnchor = {
  id: string
  label: string
  sectionId?: string
  depth: number
}

type NavigationContainer = GroupConfig | RowConfig | DependentConfig

function isNavigationContainer(item: FormItem): item is NavigationContainer {
  return (
    'kind' in item && (item.kind === 'group' || item.kind === 'row' || item.kind === 'dependent')
  )
}

function containerDomId(item: NavigationContainer): string | undefined {
  return item.id
}

function inferNavigationLabel(item: NavigationContainer): string | undefined {
  if (item.kind === 'group') {
    return resolveGroupHeading(item)?.label
  }
  if (item.kind === 'row') {
    return resolveRowHeading(item)?.label
  }
  if (item.kind === 'dependent') {
    return item.controller.label
  }
  return undefined
}

function childItems(item: NavigationContainer): FormItem[] {
  if (item.kind === 'dependent') {
    return item.dependents.fields as FormItem[]
  }
  return item.fields as FormItem[]
}

function walkNavigationContainers(
  items: readonly FormItem[],
  options: { sectionId?: string; depth: number },
  result: CollectedNavigationAnchor[],
): void {
  for (const item of items) {
    if ('kind' in item && (item.kind === 'array' || item.kind === 'slot')) {
      continue
    }

    if (!isNavigationContainer(item)) {
      continue
    }

    if (item.navigation) {
      result.push({
        id: item.navigation.id,
        label: item.navigation.label ?? inferNavigationLabel(item) ?? item.navigation.id,
        sectionId: options.sectionId,
        depth: options.depth,
      })
    }

    walkNavigationContainers(
      childItems(item),
      {
        sectionId: options.sectionId,
        depth: options.depth + 1,
      },
      result,
    )
  }
}

/** Depth-first walk collecting opt-in navigation anchors from semantic containers. */
export function collectFormNavigationAnchors(
  items: readonly FormItem[],
  options?: { sectionId?: string },
): CollectedNavigationAnchor[] {
  const result: CollectedNavigationAnchor[] = []
  walkNavigationContainers(items, { sectionId: options?.sectionId, depth: 0 }, result)
  return result
}

type NavigationMismatch = {
  navigationId: string
  containerId?: string
}

function collectNavigationMismatches(items: readonly FormItem[]): NavigationMismatch[] {
  const mismatches: NavigationMismatch[] = []

  function walk(current: readonly FormItem[]) {
    for (const item of current) {
      if (!isNavigationContainer(item)) continue

      if (item.navigation) {
        const domId = containerDomId(item)
        if (domId !== item.navigation.id) {
          mismatches.push({
            navigationId: item.navigation.id,
            containerId: domId,
          })
        }
      }

      walk(childItems(item))
    }
  }

  walk(items)
  return mismatches
}

/** Dev/test guard ensuring `navigation.id` matches the container DOM `id`. */
export function assertNavigationIdsMatchDomIds(items: readonly FormItem[]): void {
  const mismatches = collectNavigationMismatches(items)
  if (mismatches.length === 0) return

  const details = mismatches
    .map((entry) => `${entry.navigationId} (container id: ${entry.containerId ?? 'missing'})`)
    .join(', ')

  throw new Error(`Form navigation ids must match container ids: ${details}`)
}
