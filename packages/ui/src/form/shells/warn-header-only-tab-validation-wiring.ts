import type { TabbedFormTab } from './tabbed-form-panels.client'

function isHeaderOnlyTab(tab: TabbedFormTab): boolean {
  return tab.fields.length === 0 && tab.header !== undefined
}

/** Collects dev warnings for header-only tabs missing validation wiring. */
export function collectHeaderOnlyTabValidationWiringWarnings(
  tabs: readonly TabbedFormTab[],
): string[] {
  const warnings: string[] = []

  for (const tab of tabs) {
    if (tab.skipHeaderOnlyValidationWiring || !isHeaderOnlyTab(tab)) continue

    const missingErrorPaths = !tab.errorPaths?.length
    const missingResolverFields = !tab.resolverFields?.length

    if (missingErrorPaths && missingResolverFields) {
      warnings.push(
        `Header-only tab "${tab.label}" has no fields. Add errorPaths and resolverFields so tab badges and validation messages can resolve embedded errors.`,
      )
      continue
    }

    if (missingErrorPaths) {
      warnings.push(
        `Missing errorPaths on header-only tab "${tab.label}": tab badges and footer summary will not include this tab.`,
      )
    }

    if (missingResolverFields) {
      warnings.push(
        `Missing resolverFields on header-only tab "${tab.label}": validation copy may fall back to generic or Zod messages.`,
      )
    }
  }

  return warnings
}

/** Logs dev warnings when header-only tabs omit errorPaths and/or resolverFields. */
export function warnHeaderOnlyTabValidationWiring(tabs: readonly TabbedFormTab[]): void {
  if (process.env.NODE_ENV !== 'development') return

  for (const message of collectHeaderOnlyTabValidationWiringWarnings(tabs)) {
    console.warn(message)
  }
}
