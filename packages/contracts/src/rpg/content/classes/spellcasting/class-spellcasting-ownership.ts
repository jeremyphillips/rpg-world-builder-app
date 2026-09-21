import { availableClassFeatures } from '../class-feature-availability'
import type { ClassBodyFeature } from '../class'
import type { ContentGrant, GrantGroup } from '../../lib/grants'

import type { Spellcasting } from './spellcasting'

export const SPELLCASTING_GRANTING_FEATURE_IDS = ['spellcasting', 'pact-magic'] as const

export type ClassSpellcastingActivationSource = {
  spellcasting?: Spellcasting
  features: readonly ClassBodyFeature[]
}

export function isSpellcastingContentGrant(grant: ContentGrant): boolean {
  return grant.kind === 'spellcasting'
}

/** Dedicated managed feature: default group only, exactly one spellcasting grant. */
export function isClassSpellcastingGrantingFeature(feature: {
  grantGroups?: GrantGroup[]
}): boolean {
  const groups = feature.grantGroups ?? []
  if (groups.length !== 1) return false
  const group = groups[0]!
  if (group.unlock !== undefined) return false
  if (group.grants.length !== 1) return false
  return isSpellcastingContentGrant(group.grants[0]!)
}

export function findClassSpellcastingGrantingFeatures(
  source: ClassSpellcastingActivationSource,
  options?: { runtime?: boolean },
): ClassBodyFeature[] {
  const features = options?.runtime ? availableClassFeatures(source.features) : [...source.features]
  return features.filter(isClassSpellcastingGrantingFeature)
}

export function resolveClassSpellcastingFeature(
  source: ClassSpellcastingActivationSource,
  options?: { runtime?: boolean },
): ClassBodyFeature | undefined {
  return findClassSpellcastingGrantingFeatures(source, options)[0]
}

export function resolveClassSpellcastingGrant(
  source: ClassSpellcastingActivationSource,
  options?: { runtime?: boolean },
): ContentGrant | undefined {
  const feature = resolveClassSpellcastingFeature(source, options)
  const grant = feature?.grantGroups?.[0]?.grants[0]
  return grant && isSpellcastingContentGrant(grant) ? grant : undefined
}

export function resolveClassSpellcastingActivationLevel(
  source: ClassSpellcastingActivationSource,
  options?: { runtime?: boolean },
): number | undefined {
  return resolveClassSpellcastingFeature(source, options)?.level
}

export function isClassSpellcastingAvailable(source: ClassSpellcastingActivationSource): boolean {
  return resolveClassSpellcastingFeature(source, { runtime: true }) !== undefined
}

export function isSpellcastingActiveAtLevel(
  source: ClassSpellcastingActivationSource,
  classLevel: number,
  options?: { runtime?: boolean },
): boolean {
  if (!source.spellcasting) return false
  const activationLevel = resolveClassSpellcastingActivationLevel(source, options)
  if (activationLevel === undefined) return false
  return classLevel >= activationLevel
}
