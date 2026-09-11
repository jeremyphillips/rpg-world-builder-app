import type { ReactNode } from 'react'

import type { FormItem } from '../field-config'

/** A single tab definition: an id, a display label, and its ordered fields. */
export interface TabbedFormTab {
  id: string
  label: string
  fields: FormItem[]
  /** Optional leading icon for the section control (decorative; pass `aria-hidden`). */
  leadingIcon?: ReactNode
  /**
   * Extra root paths whose validation issues belong to this tab (merged with
   * prefixes inferred from `fields`; supplements only — does not replace them).
   */
  errorPaths?: string[]
  /**
   * Field configs merged into the Zod resolver error map only — not rendered.
   * Use for header/master-detail editors whose controls register under paths
   * outside `fields` (e.g. `heritage.name` with `namePrefix` in the tab header).
   */
  resolverFields?: FormItem[]
  /**
   * Optional non-field UI rendered above this tab's fields (intro copy, links,
   * placeholders). Omit fields for a panel that is entirely non-input content.
   */
  header?: ReactNode
  /**
   * When true, skips dev warnings and dashboard test assertions for header-only
   * validation wiring (e.g. non-form chrome tabs like subclass management).
   */
  skipHeaderOnlyValidationWiring?: boolean
}

/** Merges visible tab fields with supplemental resolver-only configs. */
export function collectTabbedFormResolverItems(tabs: readonly TabbedFormTab[]): FormItem[] {
  return tabs.flatMap((tab) => [...tab.fields, ...(tab.resolverFields ?? [])])
}
