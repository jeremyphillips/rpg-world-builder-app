import { availableClassFeatures } from '../class-feature-availability'
import type { ClassBodyFeature } from '../class'
import type { Spellcasting } from './spellcasting'

export type ClassSpellcastingActivationSource = {
  spellcasting?: Spellcasting
  features: readonly ClassBodyFeature[]
}

export function isSpellcastingClassFeature(feature: ClassBodyFeature): boolean {
  return feature.kind === 'spellcasting'
}

export function findSpellcastingClassFeatures(
  source: ClassSpellcastingActivationSource,
  options?: { runtime?: boolean },
): ClassBodyFeature[] {
  const features = options?.runtime ? availableClassFeatures(source.features) : [...source.features]
  return features.filter(isSpellcastingClassFeature)
}

export function resolveClassSpellcastingFeature(
  source: ClassSpellcastingActivationSource,
  options?: { runtime?: boolean },
): ClassBodyFeature | undefined {
  return findSpellcastingClassFeatures(source, options)[0]
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
