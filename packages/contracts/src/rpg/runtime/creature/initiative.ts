import { abilityModifier } from './ability-modifier'

// ---------------------------------------------------------------------------
// Initiative — creature-scoped default (DEX modifier unless a feature overrides).
// ---------------------------------------------------------------------------

/** Default initiative modifier from a DEX score (SRD: initiative = DEX mod). */
export function resolveCreatureInitiativeModifier(dexScore: number): number {
  return abilityModifier(dexScore)
}
