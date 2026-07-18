import type { NamingAssociation, NamingAssociationStrength } from '@rpg/contracts/name-generator'
import { NAMING_ASSOCIATION_STRENGTHS } from '@rpg/contracts/name-generator'

const STRENGTH_RANK = Object.fromEntries(
  NAMING_ASSOCIATION_STRENGTHS.map((strength, index) => [
    strength,
    NAMING_ASSOCIATION_STRENGTHS.length - index,
  ]),
) as Record<NamingAssociationStrength, number>

function associationSemanticKey(association: NamingAssociation): string {
  switch (association.kind) {
    case 'culture':
      return `culture:${association.cultureId}`
    case 'language':
      return `language:${association.languageId}`
    case 'species':
      return `species:${association.speciesId}`
    case 'creatureType':
      return `creatureType:${association.creatureType}`
    case 'region':
      return `region:${association.regionId}`
    case 'fictionSetting':
      return `fictionSetting:${association.fictionSettingId}`
    default: {
      const exhaustive: never = association
      return exhaustive
    }
  }
}

function mergeStrength(
  left?: NamingAssociationStrength,
  right?: NamingAssociationStrength,
): NamingAssociationStrength | undefined {
  if (left === undefined) {
    return right
  }
  if (right === undefined) {
    return left
  }

  return STRENGTH_RANK[left] >= STRENGTH_RANK[right] ? left : right
}

function withMergedStrength(
  association: NamingAssociation,
  strength: NamingAssociationStrength | undefined,
): NamingAssociation {
  if (strength === undefined) {
    return association
  }

  if (association.kind === 'language' || association.kind === 'culture') {
    return { ...association, strength }
  }

  return association
}

export function dedupeAssociations(
  associations: readonly NamingAssociation[],
): NamingAssociation[] {
  const merged = new Map<string, NamingAssociation>()

  for (const association of associations) {
    const key = associationSemanticKey(association)
    const existing = merged.get(key)

    if (existing === undefined) {
      merged.set(key, association)
      continue
    }

    if (existing.kind !== association.kind) {
      throw new Error(`Conflicting association kinds for semantic key "${key}"`)
    }

    if (existing.kind === 'language' && association.kind === 'language') {
      merged.set(
        key,
        withMergedStrength(existing, mergeStrength(existing.strength, association.strength)),
      )
      continue
    }

    if (existing.kind === 'culture' && association.kind === 'culture') {
      merged.set(
        key,
        withMergedStrength(existing, mergeStrength(existing.strength, association.strength)),
      )
      continue
    }

    merged.set(key, association)
  }

  return [...merged.values()]
}
