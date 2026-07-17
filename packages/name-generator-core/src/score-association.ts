import type {
  NamingAssociation,
  NamingAssociationStrength,
  NamingContext,
  NamingRecommendationReason,
} from '@rpg/contracts/name-generator'

// ---------------------------------------------------------------------------
// Per-association scoring helpers.
// ---------------------------------------------------------------------------

const STRENGTH_WEIGHTS: Record<NamingAssociationStrength, number> = {
  primary: 8,
  secondary: 5,
  influenced: 2,
}

export const SUBJECT_KIND_WEIGHT = 10
export const SPECIES_WEIGHT = 6
export const CREATURE_TYPE_WEIGHT = 3
export const REGION_WEIGHT = 4
export const FICTION_SETTING_WEIGHT = 4
export const TAG_WEIGHT = 2

function defaultStrength(
  strength: NamingAssociationStrength | undefined,
): NamingAssociationStrength {
  return strength ?? 'primary'
}

function scoreLanguageAssociation(
  association: Extract<NamingAssociation, { kind: 'language' }>,
  context: NamingContext,
  reasons: NamingRecommendationReason[],
): number {
  if (!context.languageIds?.includes(association.languageId)) {
    return 0
  }
  const strength = defaultStrength(association.strength)
  reasons.push({ kind: 'language', languageId: association.languageId, strength })
  return STRENGTH_WEIGHTS[strength]
}

function scoreCultureAssociation(
  association: Extract<NamingAssociation, { kind: 'culture' }>,
  context: NamingContext,
  reasons: NamingRecommendationReason[],
): number {
  const matchIds = context.conventionCultureIds ?? context.cultureIds
  if (!matchIds?.includes(association.cultureId)) {
    return 0
  }

  const strength = defaultStrength(association.strength)
  const selectedIds = context.cultureIds ?? []
  const resolutions = context.cultureResolutions ?? {}
  const reportingIds =
    selectedIds.length > 0
      ? selectedIds.filter((id) => (resolutions[id] ?? id) === association.cultureId)
      : [association.cultureId]

  for (const cultureId of reportingIds) {
    reasons.push({ kind: 'culture', cultureId, strength })
  }

  return STRENGTH_WEIGHTS[strength]
}

function scoreSpeciesAssociation(
  association: Extract<NamingAssociation, { kind: 'species' }>,
  context: NamingContext,
  reasons: NamingRecommendationReason[],
): number {
  if (!context.speciesIds?.includes(association.speciesId)) {
    return 0
  }
  reasons.push({ kind: 'species', speciesId: association.speciesId })
  return SPECIES_WEIGHT
}

function scoreCreatureTypeAssociation(
  association: Extract<NamingAssociation, { kind: 'creatureType' }>,
  context: NamingContext,
  reasons: NamingRecommendationReason[],
): number {
  if (!context.creatureTypes?.includes(association.creatureType)) {
    return 0
  }
  reasons.push({ kind: 'creatureType', creatureType: association.creatureType })
  return CREATURE_TYPE_WEIGHT
}

function scoreRegionAssociation(
  association: Extract<NamingAssociation, { kind: 'region' }>,
  context: NamingContext,
  reasons: NamingRecommendationReason[],
): number {
  if (!context.regionIds?.includes(association.regionId)) {
    return 0
  }
  reasons.push({ kind: 'region', regionId: association.regionId })
  return REGION_WEIGHT
}

function scoreFictionSettingAssociation(
  association: Extract<NamingAssociation, { kind: 'fictionSetting' }>,
  context: NamingContext,
  reasons: NamingRecommendationReason[],
): number {
  if (!context.fictionSettingIds?.includes(association.fictionSettingId)) {
    return 0
  }
  reasons.push({
    kind: 'fictionSetting',
    fictionSettingId: association.fictionSettingId,
  })
  return FICTION_SETTING_WEIGHT
}

const ASSOCIATION_SCORERS: {
  [Kind in NamingAssociation['kind']]: (
    association: Extract<NamingAssociation, { kind: Kind }>,
    context: NamingContext,
    reasons: NamingRecommendationReason[],
  ) => number
} = {
  language: scoreLanguageAssociation,
  culture: scoreCultureAssociation,
  species: scoreSpeciesAssociation,
  creatureType: scoreCreatureTypeAssociation,
  region: scoreRegionAssociation,
  fictionSetting: scoreFictionSettingAssociation,
}

export function scoreAssociation(
  association: NamingAssociation,
  context: NamingContext,
  reasons: NamingRecommendationReason[],
): number {
  return ASSOCIATION_SCORERS[association.kind](association as never, context, reasons)
}
