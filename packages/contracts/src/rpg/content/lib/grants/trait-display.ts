import type { ContentTrait } from './grants'
import { resolveTraitFacingParts, renderTraitFacingBodyHtml } from './trait-facing'

export type { TraitFacingParts } from './trait-facing'
export type { TraitFacingHost } from './trait-facing-host'
export { resolveTraitFacingParts, renderTraitFacingBodyHtml } from './trait-facing'

export type TraitDisplay = {
  name: string
  descriptionHtml?: string
}

/** Resolves display name for list labels and breadcrumbs. */
export function resolveTraitName(trait: ContentTrait): string {
  const host = { host: 'species' as const }
  return resolveTraitFacingParts(trait, host).title
}

/** @deprecated Use `resolveTraitFacingParts` with a host and `renderTraitFacingBodyHtml`. */
export function resolveTraitDisplay(trait: ContentTrait): TraitDisplay {
  const host = { host: 'species' as const }
  const parts = resolveTraitFacingParts(trait, host)
  return {
    name: parts.title,
    descriptionHtml: renderTraitFacingBodyHtml(parts),
  }
}
