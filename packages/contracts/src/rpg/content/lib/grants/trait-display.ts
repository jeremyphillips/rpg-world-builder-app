import type { ContentTrait } from './grants'
import { resolveTraitFacingParts } from './trait-facing'

export type { TraitFacingParts } from './trait-facing'
export type { TraitFacingHost } from './trait-facing-host'
export { resolveTraitFacingParts, renderTraitFacingBodyHtml } from './trait-facing'

/** Resolves display name for list labels and breadcrumbs. */
export function resolveTraitName(trait: ContentTrait): string {
  const host = { host: 'species' as const }
  return resolveTraitFacingParts(trait, host).title
}
