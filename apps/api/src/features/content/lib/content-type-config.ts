import type { SystemRulesetId } from '@rpg/contracts'

import type { OverlayPatch } from './resolve-catalog'

/**
 * Per-content-type wiring consumed by the type-agnostic resolver. Each content
 * type (classes now; spells, monsters, species, equipment later) provides one
 * config; the kernel does the patching/merge/serving over any of them. The set
 * of registered types is enumerated statically in `../content-types.ts`.
 */
export interface ContentTypeConfig<T extends { id: string } = { id: string }> {
  type: string
  /** System seed records for a ruleset. */
  loadSystem: (rulesetId: SystemRulesetId) => readonly T[]
  /** System slugs for a ruleset (homebrew may not shadow these). */
  systemSlugs: (rulesetId: SystemRulesetId) => ReadonlySet<string>
  /** A campaign's overlay patches for this type. */
  loadPatches: (campaignId: string) => Promise<OverlayPatch[]>
  /** A campaign's homebrew records for this type + ruleset. */
  loadHomebrew: (campaignId: string, rulesetId: SystemRulesetId) => Promise<T[]>
}
