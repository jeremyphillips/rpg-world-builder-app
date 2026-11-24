import { expect } from 'vitest'

import type { ClassBodyFeature, ClassFeature, ContentGrant, SubclassFeature } from '@rpg/contracts'

export type CustomClassBodyFeature = Extract<ClassBodyFeature, { kind: 'custom' }>
type DescribedSubclassFeature = Extract<SubclassFeature, { kind: 'custom' }>

export function featureDescription(
  feature: ClassBodyFeature | ClassFeature | SubclassFeature | undefined,
): string | undefined {
  if (!feature || feature.kind === 'spellcasting' || feature.kind === 'subclass-choice') {
    return undefined
  }
  return feature.description
}

export function requireCustomClassFeature(
  features: readonly ClassBodyFeature[],
  id: string,
): CustomClassBodyFeature {
  const feature = features.find((entry) => entry.id === id)
  expect(feature).toBeDefined()
  expect(feature?.kind).toBe('custom')
  return feature as CustomClassBodyFeature
}

export function requireCustomSubclassFeature(
  features: readonly SubclassFeature[] | undefined,
  id: string,
): DescribedSubclassFeature {
  const feature = features?.find((entry) => entry.id === id)
  expect(feature).toBeDefined()
  expect(feature?.kind).toBe('custom')
  return feature as DescribedSubclassFeature
}

export function spellGrantsFromFeature(
  feature: CustomClassBodyFeature | DescribedSubclassFeature | undefined,
): ContentGrant[] {
  return feature?.grantGroups?.[0]?.grants ?? []
}
