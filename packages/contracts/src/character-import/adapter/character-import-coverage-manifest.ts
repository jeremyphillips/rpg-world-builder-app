import type { DndBeyondCharacterPayload } from '../dnd-beyond/dnd-beyond-character.schema'
import type { CharacterImportCoverageEntry } from './character-import-result.schema'
import type { CharacterImportExtraction } from './character-import-result.schema'

// ---------------------------------------------------------------------------
// Coverage manifest — compares extraction against createCharacterInputSchema.
// ---------------------------------------------------------------------------

const SERVER_OWNED_CREATE_FIELDS = [
  'characterType',
  'id',
  'userId',
  'createdAt',
  'updatedAt',
] as const

export const CHARACTER_IMPORT_SERVER_OWNED_FIELDS = SERVER_OWNED_CREATE_FIELDS

type CoverageBuilder = (
  extraction: CharacterImportExtraction,
  payload: DndBeyondCharacterPayload,
) => CharacterImportCoverageEntry

const coverageForExtractionField = (
  targetPath: string,
  extractionStatus: CharacterImportExtraction[keyof CharacterImportExtraction]['status'],
  sourcePaths: string[],
  mappedReason: string,
  failureReason: string,
): CharacterImportCoverageEntry => ({
  targetPath,
  state: extractionStatus === 'mapped' ? 'mapped' : 'deferred',
  reason: extractionStatus === 'mapped' ? mappedReason : failureReason,
  sourcePaths,
})

const buildNameCoverage: CoverageBuilder = (extraction) =>
  coverageForExtractionField(
    'name',
    extraction.name.status,
    extraction.name.sourcePaths,
    'Name extracted from source character.',
    'Name was not present in the source character.',
  )

const buildAbilityScoresCoverage: CoverageBuilder = (extraction) =>
  coverageForExtractionField(
    'abilityScores',
    extraction.abilityScores.status,
    extraction.abilityScores.sourcePaths,
    'Ability scores extracted from source stat arrays and modifiers.',
    'Ability scores could not be derived from the source character.',
  )

const buildAlignmentCoverage: CoverageBuilder = (extraction) =>
  coverageForExtractionField(
    'alignment',
    extraction.alignment.status,
    extraction.alignment.sourcePaths,
    'Alignment mapped from source alignment id.',
    'Alignment is missing or unrecognized in the source character.',
  )

const buildXpCoverage: CoverageBuilder = (extraction) =>
  coverageForExtractionField(
    'xp',
    extraction.xp.status,
    extraction.xp.sourcePaths,
    'Experience points mapped from source current XP.',
    'Experience points were not available in the source character.',
  )

const buildHitPointsCoverage: CoverageBuilder = (extraction) =>
  coverageForExtractionField(
    'hitPoints',
    extraction.hitPoints.status,
    extraction.hitPoints.sourcePaths,
    'Hit point inputs mapped to local runtime shape.',
    'Hit point inputs were not available in the source character.',
  )

const buildNarrativeCoverage: CoverageBuilder = (extraction) => {
  if (extraction.narrative.status === 'mapped') {
    return {
      targetPath: 'narrative',
      state: 'mapped',
      reason: 'Narrative fields extracted from source traits and notes.',
      sourcePaths: extraction.narrative.sourcePaths,
    }
  }

  return {
    targetPath: 'narrative',
    state: 'not-applicable',
    reason: 'Narrative is optional and no personal narrative was present in the source.',
    sourcePaths: extraction.narrative.sourcePaths,
  }
}

const buildRulesetIdCoverage: CoverageBuilder = (_extraction, _payload) => ({
  targetPath: 'rulesetId',
  state: 'deferred',
  reason: 'Ruleset selection requires campaign or application context, not provider payload.',
})

const buildClassesCoverage: CoverageBuilder = (_extraction, payload) => {
  const hasClasses = (payload.classes?.length ?? 0) > 0
  return {
    targetPath: 'classes',
    state: hasClasses ? 'unresolved-reference' : 'deferred',
    reason: hasClasses
      ? 'Class levels are present in the source but require local catalog matching.'
      : 'No class data was found in the source character.',
    sourcePaths: hasClasses ? ['data.classes'] : undefined,
  }
}

const buildSpeciesCoverage: CoverageBuilder = (extraction) => {
  if (extraction.species.status === 'mapped') {
    return {
      targetPath: 'species',
      state: 'unresolved-reference',
      reason:
        'Species was extracted from data.race for preview; local catalog matching is still required before save.',
      sourcePaths: extraction.species.sourcePaths,
    }
  }

  return {
    targetPath: 'species',
    state: extraction.species.status === 'missing-source' ? 'deferred' : 'unresolved-reference',
    reason:
      extraction.species.status === 'missing-source'
        ? 'No species/race data was found in the source character.'
        : 'Species/race data is present in the source but requires local catalog matching.',
    sourcePaths: extraction.species.sourcePaths,
  }
}

const buildEquipmentCoverage: CoverageBuilder = (extraction, payload) => {
  const hasInventory = (payload.inventory?.length ?? 0) > 0
  if (extraction.equipment.status === 'mapped') {
    return {
      targetPath: 'equipment',
      state: 'unresolved-reference',
      reason:
        'Inventory items were extracted for preview; canonical equipment rows require local catalog matching.',
      sourcePaths: extraction.equipment.sourcePaths,
    }
  }

  return {
    targetPath: 'equipment',
    state: hasInventory ? 'unresolved-reference' : 'deferred',
    reason: hasInventory
      ? 'Inventory items are present in the source but require local catalog matching.'
      : 'No inventory was found in the source character.',
    sourcePaths: hasInventory ? ['data.inventory'] : undefined,
  }
}

const buildWealthCoverage: CoverageBuilder = (_extraction, payload) => {
  const hasCurrency = payload.currencies != null
  return {
    targetPath: 'wealth',
    state: hasCurrency ? 'unresolved-reference' : 'deferred',
    reason: hasCurrency
      ? 'Currency totals are present in the source but require local wealth mapping.'
      : 'No currency data was found in the source character.',
    sourcePaths: hasCurrency ? ['data.currencies'] : undefined,
  }
}

const buildProficienciesCoverage: CoverageBuilder = (extraction) => {
  const hasPreview =
    extraction.proficiencies.status === 'mapped' &&
    ((extraction.proficiencies.value?.skills.length ?? 0) > 0 ||
      (extraction.proficiencies.value?.tools.length ?? 0) > 0)

  return {
    targetPath: 'proficiencies',
    state: 'deferred',
    reason: hasPreview
      ? 'Recognized skill and tool proficiencies were extracted for preview; canonical stored rows require catalog and provenance resolution.'
      : 'Canonical proficiency rows are not produced during the experimental import preview.',
    sourcePaths: extraction.proficiencies.sourcePaths,
  }
}

const buildSpellsCoverage: CoverageBuilder = (_extraction, payload) => {
  const spellCount = (payload.classSpells?.length ?? 0) + (payload.raceSpells?.length ?? 0)
  return {
    targetPath: 'spells',
    state: spellCount > 0 ? 'unresolved-reference' : 'deferred',
    reason:
      spellCount > 0
        ? 'Spells are present in the source but require local catalog matching.'
        : 'Spell import is deferred in the experimental preview.',
    sourcePaths: spellCount > 0 ? ['data.classSpells', 'data.raceSpells'] : undefined,
  }
}

const buildFeatsCoverage: CoverageBuilder = (_extraction, payload) => {
  const hasFeats = (payload.feats?.length ?? 0) > 0
  return {
    targetPath: 'feats',
    state: hasFeats ? 'unresolved-reference' : 'deferred',
    reason: hasFeats
      ? 'Feats are present in the source but require local catalog matching.'
      : 'Feat import is deferred in the experimental preview.',
    sourcePaths: hasFeats ? ['data.feats'] : undefined,
  }
}

const buildImageKeyCoverage: CoverageBuilder = (_extraction, _payload) => ({
  targetPath: 'imageKey',
  state: 'deferred',
  reason: 'Portrait import is deferred; image keys are assigned by the application.',
})

const buildCampaignIdCoverage: CoverageBuilder = (_extraction, _payload) => ({
  targetPath: 'campaignId',
  state: 'deferred',
  reason: 'Campaign association is chosen during save, not from the provider payload.',
})

const CREATE_INPUT_COVERAGE_BUILDERS: CoverageBuilder[] = [
  buildNameCoverage,
  buildAbilityScoresCoverage,
  buildAlignmentCoverage,
  buildXpCoverage,
  buildHitPointsCoverage,
  buildNarrativeCoverage,
  buildRulesetIdCoverage,
  buildClassesCoverage,
  buildSpeciesCoverage,
  buildEquipmentCoverage,
  buildWealthCoverage,
  buildProficienciesCoverage,
  buildSpellsCoverage,
  buildFeatsCoverage,
  buildImageKeyCoverage,
  buildCampaignIdCoverage,
]

export function buildServerOwnedCoverageEntries(): CharacterImportCoverageEntry[] {
  return [
    {
      targetPath: 'characterType',
      state: 'server-owned',
      reason: 'The API sets character type when saving an imported PC.',
    },
    {
      targetPath: 'id',
      state: 'server-owned',
      reason: 'The API assigns the character id on save.',
    },
    {
      targetPath: 'userId',
      state: 'server-owned',
      reason: 'The API assigns ownership from the authenticated session.',
    },
    {
      targetPath: 'createdAt',
      state: 'server-owned',
      reason: 'The API assigns creation timestamp on save.',
    },
    {
      targetPath: 'updatedAt',
      state: 'server-owned',
      reason: 'The API assigns update timestamp on save.',
    },
  ]
}

export function buildCharacterImportCoverage(
  extraction: CharacterImportExtraction,
  payload: DndBeyondCharacterPayload,
): CharacterImportCoverageEntry[] {
  return CREATE_INPUT_COVERAGE_BUILDERS.map((build) => build(extraction, payload))
}
