import { createCharacterInputSchema } from '../character/create-input'
import type { CreateCharacterInput } from '../character/create-input'
import { levelOneMaxHp } from '../character/derive/index'
import { formatFieldMessage } from '../../../validation/define-message'
import { ABILITY_IDS, type Ability } from '../../vocab/ability'
import { assembleCharacterProficiencies } from './assembly/assemble-proficiencies'
import { characterBuilderValidationMessages } from './character-builder-messages'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from './context'
import type { CharacterBuilderDraft } from './draft'
import type { CharacterBuildEngineOptions } from './engine-options'
import { assembleClassSpellcasting } from './assembly/assemble-spellcasting'
import { assembleStartingEquipment } from './assembly/assemble-starting-equipment'
import { validateCharacterBuild } from './validate/validate-character-build'
import type { CharacterBuildValidationResult } from './validate/types'

// ---------------------------------------------------------------------------
// Finalization — assembles CreateCharacterInput after finalSubmit validation.
// ---------------------------------------------------------------------------

export class CharacterBuildFinalizationError extends Error {
  readonly validationIssues

  constructor(validationIssues: CharacterBuildValidationResult['issues']) {
    super(formatFieldMessage(characterBuilderValidationMessages.finalizationFailed()))
    this.name = 'CharacterBuildFinalizationError'
    this.validationIssues = validationIssues
  }
}

function requireCompleteAbilityScores(draft: CharacterBuilderDraft): Record<Ability, number> {
  const scores = draft.abilities.scores
  if (!scores) {
    throw new CharacterBuildFinalizationError([
      {
        code: 'abilities_incomplete',
        message: formatFieldMessage(characterBuilderValidationMessages.abilitiesIncomplete()),
        path: 'abilities.scores',
        stepId: 'abilities',
      },
    ])
  }

  const complete = {} as Record<Ability, number>
  for (const ability of ABILITY_IDS) {
    const score = scores[ability]
    if (typeof score !== 'number') {
      throw new CharacterBuildFinalizationError([
        {
          code: 'abilities_incomplete',
          message: formatFieldMessage(characterBuilderValidationMessages.abilitiesIncomplete()),
          path: 'abilities.scores',
          stepId: 'abilities',
        },
      ])
    }
    complete[ability] = score
  }

  return complete
}

/**
 * Runs `finalSubmit` validation, then assembles a `CreateCharacterInput`.
 *
 * Returns `CreateCharacterInput`, never a full `Character` — the API assigns
 * `id`, `userId`, and timestamps.
 */
export function finalizeCharacterBuild(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  options: CharacterBuildEngineOptions = {},
): CreateCharacterInput {
  const validation = validateCharacterBuild(draft, context, 'finalSubmit', options)
  if (!validation.ok) {
    throw new CharacterBuildFinalizationError(validation.issues)
  }

  const choiceSets = options.resolvedChoiceSets ?? []
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const classId = draft.class.classId!
  const speciesId = draft.species.speciesId!
  const characterClass = catalogIndex.classes.get(classId)!
  const abilityScores = requireCompleteAbilityScores(draft)
  const proficiencies = assembleCharacterProficiencies(
    draft,
    catalogIndex,
    choiceSets,
    characterClass,
    context,
  )
  const { equipment, wealth } = assembleStartingEquipment(draft, catalogIndex)

  const input: CreateCharacterInput = {
    characterType: 'pc',
    campaignId: null,
    name: draft.identity.name!.trim(),
    imageKey: draft.identity.imageKey,
    rulesetId: context.rulesetId,
    classes: [{ classId, level: draft.class.level }],
    species: {
      id: speciesId,
      heritageId: draft.species.heritageId,
    },
    alignment: draft.identity.alignment!,
    xp: 0,
    abilityScores,
    hitPoints: {
      base: levelOneMaxHp(characterClass.hitDie, abilityScores.con),
      temporary: 0,
    },
    proficiencies,
    spells: assembleClassSpellcasting(draft, context, choiceSets),
    equipment,
    wealth,
    narrative: draft.identity.narrative,
    feats: [],
  }

  return createCharacterInputSchema.parse(input)
}
