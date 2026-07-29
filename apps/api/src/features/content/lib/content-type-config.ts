import type { SystemRulesetId } from '@rpg/contracts'

import type { OverlayPatch } from './resolve-catalog'

export interface SystemContentConfig<T extends { id: string }> {
  /** System seed records for a ruleset. */
  load: (rulesetId: SystemRulesetId) => readonly T[]
  /** System slugs for a ruleset (campaign-authored content may not shadow these). */
  slugs: (rulesetId: SystemRulesetId) => ReadonlySet<string>
  /** Campaign overlays keyed to bundled system records. */
  loadPatches: (campaignId: string) => Promise<OverlayPatch[]>
}

/**
 * Per-content-type wiring consumed by the type-agnostic resolver. Each content
 * type (classes now; spells, monsters, species, equipment later) provides one
 * config; the kernel does the patching/merge/serving over any of them. The set
 * of registered types is enumerated statically in `../content-types.ts`.
 */
export interface ContentTypeConfig<T extends { id: string } = { id: string }> {
  type: string
  /** Omitted for content types whose normal catalog is entirely campaign-authored. */
  system?: SystemContentConfig<T>
  /** A campaign's homebrew records for this type + ruleset. */
  loadHomebrew: (campaignId: string, rulesetId: SystemRulesetId) => Promise<T[]>
  /** Patch keys replaced at the top level during overlay merge (not deep-merged). */
  patchReplaceKeys?: readonly string[]
}

/** System records for a type, or an empty catalog when the type has no bundled content. */
export function loadSystemContent<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  rulesetId: SystemRulesetId,
): readonly T[] {
  return config.system?.load(rulesetId) ?? []
}

/** Reserved system slugs, empty when the type has no bundled content. */
export function loadSystemContentSlugs<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  rulesetId: SystemRulesetId,
): ReadonlySet<string> {
  return config.system?.slugs(rulesetId) ?? new Set<string>()
}

/** Campaign overlays for bundled records, empty when no system catalog exists. */
export async function loadSystemContentPatches<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  campaignId: string,
): Promise<OverlayPatch[]> {
  return config.system?.loadPatches(campaignId) ?? []
}
