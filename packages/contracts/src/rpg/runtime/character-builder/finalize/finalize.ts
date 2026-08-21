import { type ZodError } from 'zod'

import { createCharacterInputSchema } from '../../character/create-input'
import type { CreateCharacterInput } from '../../character/create-input'
import { formatFieldMessage } from '../../../../validation/define-message'
import { ABILITY_IDS, type Ability } from '../../../vocab/ability'
import { assembleCharacterProficiencies } from '../assembly/assemble-proficiencies'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import {
  DEFAULT_BUILDER_HIT_POINT_SOURCE,
  resolveBuilderMaxHitPoints,
} from '../progression/builder-hit-points'
import {
  isBuilderLevelZeroClassless,
  isClassProgressionApplicable,
  isLevelZeroNpcPermitted,
  sanitizeClassForLevel,
} from '../progression/character-level-policy'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../context'
import { indexPlayableBuilderCatalog } from '../preview/index-playable-builder-catalog'
import type { CharacterBuilderDraft } from '../draft/draft'
import type { CharacterBuildEngineOptions } from '../engine-options'
import { assembleClassSpellcasting } from '../assembly/assemble-spellcasting'
import {
  assembleGrantedSpells,
  mergeCharacterSpellEntries,
} from '../assembly/assemble-granted-spells'
import { assembleStartingEquipment } from '../assembly/assemble-starting-equipment'
import {
  characterWealthFromGrant,
  EMPTY_CHARACTER_EQUIPMENT,
} from '../../character/sheet/equipment-inventory'
import { normalizeCharacterWealthGrant } from '../../../primitives/character-wealth-grant'
import { mapCreateInputZodIssueMessage } from './finalize-zod-issue-messages'
import { validateCharacterBuild } from '../validate/validate-character-build'
import { validationIssue } from '../validate/issue'
import type { CharacterBuildValidationResult } from '../validate/types'

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
  playableIndex: ReturnType<typeof indexPlayableBuilderCatalog>,
  context: CharacterBuildContext,
): CharacterBuildValidationResult['issues'] {
  const issues: CharacterBuildValidationResult['issues'] = []
  const effectiveDraft = sanitizeClassForLevel(draft)

  if (isClassProgressionApplicable(draft.class.level)) {
    const classId = effectiveDraft.class.classId
    if (!classId) {
      issues.push(
        validationIssue('class_required', characterBuilderValidationMessages.classRequired(), {
          path: 'class.classId',
          stepId: 'class',
        }),
      )
    } else if (!playableIndex.classes.get(classId)) {
      issues.push(
        validationIssue(
          'class_not_in_catalog',
          characterBuilderValidationMessages.classNotInCatalog(),
          { path: 'class.classId', stepId: 'class' },
        ),
      )
    }
  } else if (draft.class.classId) {
    issues.push(
      validationIssue(
        'class_not_permitted_at_level_zero',
        characterBuilderValidationMessages.classNotPermittedAtLevelZero(),
        { path: 'class.classId', stepId: 'class' },
      ),
    )
  }

  if (isBuilderLevelZeroClassless(draft, context) && !isLevelZeroNpcPermitted(context)) {
    issues.push(
      validationIssue(
        'level_zero_not_permitted',
        characterBuilderValidationMessages.levelZeroNotPermitted(),
        { path: 'class.level', stepId: 'class' },
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
  } else if (!playableIndex.species.get(speciesId)) {
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

function assembleLevelZeroStartingEquipment(
  _draft: CharacterBuilderDraft,
  levelZeroRules: CharacterBuildContext['characterCreationRules']['levelZeroNpcs'],
): {
  equipment: ReturnType<typeof assembleStartingEquipment>['equipment']
  wealth: ReturnType<typeof assembleStartingEquipment>['wealth']
} {
  const normalizedWealth = normalizeCharacterWealthGrant(levelZeroRules.startingWealth)
  return {
    equipment: { ...EMPTY_CHARACTER_EQUIPMENT },
    wealth: characterWealthFromGrant(normalizedWealth),
  }
}

function assertPcFinalizationContext(context: CharacterBuildContext): void {
  if (context.characterKind === 'npc') {
    throw new CharacterBuildFinalizationError([
      {
        code: 'npc_build_not_permitted',
        message: 'NPC builds must use finalizeNpcCharacterBuild.',
      },
    ])
  }
}

/**
 * Shared sheet assembly for PC and NPC finalizers. Returns an untyped object
 * without schema parse — each public finalizer validates against its own schema.
 */
export function assembleCharacterBuildSheet(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  options: CharacterBuildEngineOptions = {},
) {
  const validation = validateCharacterBuild(draft, context, 'finalSubmit', options)
  if (!validation.ok) {
    throw new CharacterBuildFinalizationError(validation.issues)
  }

  const choiceSets = options.resolvedChoiceSets ?? []
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const playableIndex = indexPlayableBuilderCatalog(context)
  const effectiveDraft = sanitizeClassForLevel(draft)
  const isClasslessLevelZero = isBuilderLevelZeroClassless(draft, context)

  const catalogIssues = resolveFinalizeCatalogIssues(draft, playableIndex, context)
  if (catalogIssues.length > 0) {
    throw new CharacterBuildFinalizationError(catalogIssues)
  }

  const classId = effectiveDraft.class.classId
  const speciesId = effectiveDraft.species.speciesId!
  const characterClass = classId ? catalogIndex.classes.get(classId) : undefined
  const abilityScores = requireCompleteAbilityScores(effectiveDraft)
  const proficiencies = assembleCharacterProficiencies(
    effectiveDraft,
    catalogIndex,
    choiceSets,
    characterClass,
    context,
  )

  const levelZeroRules = context.characterCreationRules.levelZeroNpcs
  const { equipment, wealth } = isClasslessLevelZero
    ? assembleLevelZeroStartingEquipment(effectiveDraft, levelZeroRules)
    : assembleStartingEquipment(effectiveDraft, catalogIndex, {
        startingWealth: context.characterCreationRules.startingWealth,
        rulesetId: context.rulesetId,
      })

  const maxHp = resolveBuilderMaxHitPoints(effectiveDraft, characterClass, {
    source: DEFAULT_BUILDER_HIT_POINT_SOURCE,
    levelZeroRules: isClasslessLevelZero ? levelZeroRules : undefined,
  })

  const spells = isClasslessLevelZero
    ? []
    : mergeCharacterSpellEntries(
        assembleClassSpellcasting(effectiveDraft, context, choiceSets),
        assembleGrantedSpells(effectiveDraft, catalogIndex, characterClass!),
      )

  return {
    name: effectiveDraft.identity.name!.trim(),
    imageKey: effectiveDraft.identity.imageKey,
    rulesetId: context.rulesetId,
    classes: isClasslessLevelZero ? [] : [{ classId: classId!, level: effectiveDraft.class.level }],
    species: {
      id: speciesId,
      heritageId: effectiveDraft.species.heritageId,
    },
    alignment: effectiveDraft.identity.alignment!,
    xp: null,
    abilityScores,
    hitPoints: {
      base: maxHp,
      current: maxHp,
      temporary: 0,
    },
    proficiencies,
    spells,
    equipment,
    wealth,
    narrative: effectiveDraft.identity.narrative,
    connections: effectiveDraft.connections,
    feats: [],
  }
}

/**
 * Runs `finalSubmit` validation, then assembles and schema-validates a
 * `CreateCharacterInput`.
 *
 * Returns `CreateCharacterInput`, never a full `Character` — the API assigns
 * `id`, `userId`, and timestamps. Rejects NPC build contexts.
 */
export function finalizePcCharacterBuild(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  options: CharacterBuildEngineOptions = {},
): CreateCharacterInput {
  assertPcFinalizationContext(context)

  const sheet = assembleCharacterBuildSheet(draft, context, options)
  return parseCreateCharacterInput({
    characterType: 'pc',
    ...sheet,
  })
}

/**
 * @deprecated Use {@link finalizePcCharacterBuild} for PC builds.
 */
export const finalizeCharacterBuild = finalizePcCharacterBuild
