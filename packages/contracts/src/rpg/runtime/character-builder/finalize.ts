import { type ZodError } from 'zod'

import { createCharacterInputSchema } from '../character/create-input'
import type { CreateCharacterInput } from '../character/create-input'
import { formatFieldMessage } from '../../../validation/define-message'
import { ABILITY_IDS, type Ability } from '../../vocab/ability'
import { assembleCharacterProficiencies } from './assembly/assemble-proficiencies'
import { characterBuilderValidationMessages } from './character-builder-messages'
import { DEFAULT_BUILDER_HIT_POINT_SOURCE, resolveBuilderMaxHitPoints } from './builder-hit-points'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from './context'
import type { CharacterBuilderDraft } from './draft'
import type { CharacterBuildEngineOptions } from './engine-options'
import { assembleClassSpellcasting } from './assembly/assemble-spellcasting'
import {
  assembleGrantedSpells,
  mergeCharacterSpellEntries,
} from './assembly/assemble-granted-spells'
import { assembleStartingEquipment } from './assembly/assemble-starting-equipment'
import { mapCreateInputZodIssueMessage } from './finalize-zod-issue-messages'
import { validateCharacterBuild } from './validate/validate-character-build'
import { validationIssue } from './validate/issue'
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

/** Structural check — avoids `instanceof` failures across duplicate module instances in Vite. */
export function isCharacterBuildFinalizationError(
  error: unknown,
): error is CharacterBuildFinalizationError {
  if (typeof error !== 'object' || error === null) return false

  const candidate = error as Partial<CharacterBuildFinalizationError>
  return (
    candidate.name === 'CharacterBuildFinalizationError' &&
    Array.isArray(candidate.validationIssues)
  )
}

function zodIssuesToFinalizationIssues(error: ZodError): CharacterBuildValidationResult['issues'] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : undefined
    const mappedMessage = mapCreateInputZodIssueMessage(path, issue.code)

    return {
      code: 'create_input_invalid',
      message: mappedMessage ?? issue.message,
      path,
    }
  })
}

function resolveFinalizeCatalogIssues(
  draft: CharacterBuilderDraft,
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>,
): CharacterBuildValidationResult['issues'] {
  const issues: CharacterBuildValidationResult['issues'] = []

  const classId = draft.class.classId
  if (!classId) {
    issues.push(
      validationIssue('class_required', characterBuilderValidationMessages.classRequired(), {
        path: 'class.classId',
        stepId: 'class',
      }),
    )
  } else if (!catalogIndex.classes.get(classId)) {
    issues.push(
      validationIssue(
        'class_not_in_catalog',
        characterBuilderValidationMessages.classNotInCatalog(),
        { path: 'class.classId', stepId: 'class' },
      ),
    )
  }

  const speciesId = draft.species.speciesId
  if (!speciesId) {
    issues.push(
      validationIssue('species_required', characterBuilderValidationMessages.speciesRequired(), {
        path: 'species.speciesId',
        stepId: 'species',
      }),
    )
  } else if (!catalogIndex.species.get(speciesId)) {
    issues.push(
      validationIssue(
        'species_not_in_catalog',
        characterBuilderValidationMessages.speciesNotInCatalog(),
        { path: 'species.speciesId', stepId: 'species' },
      ),
    )
  }

  if (!draft.identity.name?.trim()) {
    issues.push(
      validationIssue('name_required', characterBuilderValidationMessages.nameRequired(), {
        path: 'identity.name',
        stepId: 'identity',
      }),
    )
  }

  if (!draft.identity.alignment) {
    issues.push(
      validationIssue(
        'alignment_required',
        characterBuilderValidationMessages.alignmentRequired(),
        { path: 'identity.alignment', stepId: 'identity' },
      ),
    )
  }

  return issues
}

function parseCreateCharacterInput(input: unknown): CreateCharacterInput {
  const parsed = createCharacterInputSchema.safeParse(input)
  if (!parsed.success) {
    throw new CharacterBuildFinalizationError(zodIssuesToFinalizationIssues(parsed.error))
  }

  return parsed.data
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

  const catalogIssues = resolveFinalizeCatalogIssues(draft, catalogIndex)
  if (catalogIssues.length > 0) {
    throw new CharacterBuildFinalizationError(catalogIssues)
  }

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
  const { equipment, wealth } = assembleStartingEquipment(draft, catalogIndex, {
    startingWealth: context.characterCreationRules.startingWealth,
  })

  const maxHp = resolveBuilderMaxHitPoints(draft, characterClass, {
    source: DEFAULT_BUILDER_HIT_POINT_SOURCE,
  })

  const input: CreateCharacterInput = {
    characterType: 'pc',
    name: draft.identity.name!.trim(),
    imageKey: draft.identity.imageKey,
    rulesetId: context.rulesetId,
    classes: [{ classId, level: draft.class.level }],
    species: {
      id: speciesId,
      heritageId: draft.species.heritageId,
    },
    alignment: draft.identity.alignment!,
    xp: null,
    abilityScores,
    hitPoints: {
      base: maxHp,
      current: maxHp,
      temporary: 0,
    },
    proficiencies,
    spells: mergeCharacterSpellEntries(
      assembleClassSpellcasting(draft, context, choiceSets),
      assembleGrantedSpells(draft, catalogIndex, characterClass),
    ),
    equipment,
    wealth,
    narrative: draft.identity.narrative,
    feats: [],
  }

  return parseCreateCharacterInput(input)
}
