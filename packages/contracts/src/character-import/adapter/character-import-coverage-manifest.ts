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

type CatalogMatchablePreview = { status: string }

type CatalogMatchedListCoverageOptions = {
  mappedReason: string
  partialReason: string
  noneMatchedReason: string
  hasSourceData: boolean
  deferredReason: string
  unresolvedWhenPresentReason: string
  sourcePathsWhenPresent?: string[]
}

const buildCatalogMatchedListCoverage = (
  targetPath: string,
  extractionStatus: CharacterImportExtraction[keyof CharacterImportExtraction]['status'],
  sourcePaths: string[] | undefined,
  items: CatalogMatchablePreview[],
  options: CatalogMatchedListCoverageOptions,
): CharacterImportCoverageEntry => {
  const allResolved =
    extractionStatus === 'mapped' && items.every((entry) => entry.status === 'mapped')
  const someResolved =
    extractionStatus === 'mapped' &&
    items.some((entry) => entry.status === 'mapped') &&
    items.some((entry) => entry.status !== 'mapped')

  if (allResolved) {
    return {
      targetPath,
      state: 'mapped',
      reason: options.mappedReason,
      sourcePaths,
    }
  }

  if (someResolved) {
    return {
      targetPath,
      state: 'unresolved-reference',
      reason: options.partialReason,
      sourcePaths,
    }
  }

  if (extractionStatus === 'mapped') {
    return {
      targetPath,
      state: 'unresolved-reference',
      reason: options.noneMatchedReason,
      sourcePaths,
    }
  }

  return {
    targetPath,
    state: options.hasSourceData ? 'unresolved-reference' : 'deferred',
    reason: options.hasSourceData ? options.unresolvedWhenPresentReason : options.deferredReason,
    sourcePaths: options.hasSourceData ? options.sourcePathsWhenPresent : undefined,
  }
}

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

const buildAlignmentCoverage: CoverageBuilder = (extraction) => {
  if (extraction.alignment.status === 'mapped') {
    return {
      targetPath: 'alignment',
      state: 'mapped',
      reason: 'Alignment mapped from source alignment data.',
      sourcePaths: extraction.alignment.sourcePaths,
    }
  }

  return {
    targetPath: 'alignment',
    state: 'not-applicable',
    reason: 'Alignment was not set on the source character.',
    sourcePaths: extraction.alignment.sourcePaths,
  }
}

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

const buildClassesCoverage: CoverageBuilder = (extraction) => {
  const classes = extraction.classes.value ?? []
  const allResolved =
    extraction.classes.status === 'mapped' && classes.every((entry) => entry.status === 'mapped')

  if (allResolved) {
    return {
      targetPath: 'classes',
      state: 'mapped',
      reason: 'Classes were extracted and matched to the local catalog.',
      sourcePaths: extraction.classes.sourcePaths,
    }
  }

  if (extraction.classes.status === 'mapped') {
    return {
      targetPath: 'classes',
      state: 'unresolved-reference',
      reason: 'One or more source classes require local catalog matching.',
      sourcePaths: extraction.classes.sourcePaths,
    }
  }

  return {
    targetPath: 'classes',
    state: extraction.classes.status === 'missing-source' ? 'deferred' : 'unresolved-reference',
    reason:
      extraction.classes.status === 'missing-source'
        ? 'No class data was found in the source character.'
        : 'Class data is present in the source but requires local catalog matching.',
    sourcePaths: extraction.classes.sourcePaths,
  }
}

const buildSpeciesCoverage: CoverageBuilder = (extraction) => {
  const species = extraction.species.value

  if (extraction.species.status === 'mapped' && species?.status === 'mapped') {
    return {
      targetPath: 'species',
      state: 'mapped',
      reason: 'Species was extracted from data.race and matched to the local catalog.',
      sourcePaths: extraction.species.sourcePaths,
    }
  }

  if (extraction.species.status === 'mapped') {
    return {
      targetPath: 'species',
      state: 'unresolved-reference',
      reason: 'Species was extracted from data.race but requires local catalog matching.',
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

  return buildCatalogMatchedListCoverage(
    'equipment',
    extraction.equipment.status,
    extraction.equipment.sourcePaths,
    extraction.equipment.value ?? [],
    {
      mappedReason: 'Inventory items were extracted and matched to the local catalog.',
      partialReason:
        'Some inventory items matched the local catalog; others require manual review.',
      noneMatchedReason: 'Inventory items were extracted but none matched the local catalog.',
      hasSourceData: hasInventory,
      deferredReason: 'No inventory was found in the source character.',
      unresolvedWhenPresentReason:
        'Inventory items are present in the source but require local catalog matching.',
      sourcePathsWhenPresent: ['data.inventory'],
    },
  )
}

const buildWealthCoverage: CoverageBuilder = (extraction) => {
  if (extraction.wealth.status === 'mapped') {
    return {
      targetPath: 'wealth',
      state: 'mapped',
      reason: 'Currency totals were mapped to the local wealth shape.',
      sourcePaths: extraction.wealth.sourcePaths,
    }
  }

  return {
    targetPath: 'wealth',
    state: 'deferred',
    reason: 'No currency data was found in the source character.',
    sourcePaths: extraction.wealth.sourcePaths,
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

const buildSpellsCoverage: CoverageBuilder = (extraction, payload) => {
  const classSpellCount = (payload.classSpells ?? []).reduce(
    (count, group) => count + (group.spells?.length ?? 0),
    0,
  )
  const raceSpellCount = payload.raceSpells?.length ?? 0
  const spellCount = classSpellCount + raceSpellCount

  return buildCatalogMatchedListCoverage(
    'spells',
    extraction.spells.status,
    extraction.spells.sourcePaths,
    extraction.spells.value ?? [],
    {
      mappedReason: 'Class spells were extracted and matched to the local catalog.',
      partialReason: 'Some class spells matched the local catalog; others require manual review.',
      noneMatchedReason: 'Class spells were extracted but none matched the local catalog.',
      hasSourceData: spellCount > 0,
      deferredReason: 'Spell import is deferred in the experimental preview.',
      unresolvedWhenPresentReason:
        'Spells are present in the source but require local catalog matching.',
      sourcePathsWhenPresent: ['data.classSpells', 'data.raceSpells'],
    },
  )
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
