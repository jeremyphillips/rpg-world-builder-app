import { createCharacterInputSchema } from '../character/create-input'
import type { CreateCharacterInput } from '../character/create-input'
import type { CharacterEquipment } from '../character/equipment-inventory'
import type { CharacterSpellEntry } from '../character/equipment-inventory'
import { levelOneMaxHp } from '../character/derive/index'
import { ABILITY_IDS, type Ability } from '../../vocab/ability'
import { assembleCharacterProficiencies } from './assemble-proficiencies'
import { characterBuilderValidationMessages } from './character-builder-messages'
import type { ChoiceSet } from './choice-set'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from './context'
import type { CharacterBuilderDraft } from './draft'
import type { CharacterBuildEngineOptions } from './engine-options'
import { validateCharacterBuild, type CharacterBuildValidationResult } from './validate'

// ---------------------------------------------------------------------------
// Finalization — assembles CreateCharacterInput after finalSubmit validation.
// ---------------------------------------------------------------------------

export class CharacterBuildFinalizationError extends Error {
  readonly validationIssues

  constructor(validationIssues: CharacterBuildValidationResult['issues']) {
    super(characterBuilderValidationMessages.finalizationFailed())
    this.name = 'CharacterBuildFinalizationError'
    this.validationIssues = validationIssues
  }
}

const EMPTY_EQUIPMENT: CharacterEquipment = {
  weapons: [],
  armor: [],
  tools: [],
  gear: [],
  magicItems: [],
  vehicles: [],
  mounts: [],
}

function requireCompleteAbilityScores(draft: CharacterBuilderDraft): Record<Ability, number> {
  const scores = draft.abilities.scores
  if (!scores) {
    throw new CharacterBuildFinalizationError([
      {
        code: 'abilities_incomplete',
        message: characterBuilderValidationMessages.abilitiesIncomplete(),
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
          message: characterBuilderValidationMessages.abilitiesIncomplete(),
          path: 'abilities.scores',
          stepId: 'abilities',
        },
      ])
    }
    complete[ability] = score
  }

  return complete
}

function selectedSpells(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): CharacterSpellEntry[] {
  const spells: CharacterSpellEntry[] = []

  for (const choiceSet of choiceSets) {
    if (choiceSet.choiceType !== 'cantrip' && choiceSet.choiceType !== 'spell') continue

    const preparationState = choiceSet.choiceType === 'cantrip' ? 'known' : 'prepared'
    const selections = draft.choiceSelections[choiceSet.id] ?? []

    for (const spellId of selections) {
      spells.push({
        spellId,
        preparationState,
        sources: [{ kind: 'classFeature', sourceId: choiceSet.sourceId, grantId: choiceSet.id }],
      })
    }
  }

  return spells
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
  )

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
    languages: [],
    spells: selectedSpells(draft, choiceSets),
    equipment: EMPTY_EQUIPMENT,
    wealth: { cp: 0, sp: 0, gp: 0, pp: 0 },
    narrative: draft.identity.description ? { backstory: draft.identity.description } : undefined,
    feats: [],
  }

  return createCharacterInputSchema.parse(input)
}
