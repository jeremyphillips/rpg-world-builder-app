import { z } from 'zod'

import { builderLevelSchema } from '../../../primitives/level'
import { abilitySchema, type Ability } from '../../../vocab/ability'
import { alignmentSchema } from '../../../vocab/alignment'
import { genderSchema } from '../../../vocab/character-gender'
import { npcTemplateIdSchema } from '../../../vocab/npc/npc-template'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import type { CharacterBuildContext } from '../context'
import { isClassProgressionApplicable } from '../progression/character-level-policy'
import { resolvePlayableBuilderContent } from '../preview/resolve-playable-builder-content'
import { validateBuilderCharacterLevel } from '../progression/builder-level'
import type { NpcEquipmentPreferenceEntry } from './equipment-preference-stream'
import type { SourcedRecommendation } from '../sourced-recommendation'
import { validationIssue } from '../validate/issue'
import type { CharacterBuildValidationIssue } from '../validate/types'

// ---------------------------------------------------------------------------
// AutomaticNpcBuildSeed — the compact input for automatic NPC build
// resolution (Quick NPC). Future presets/templates supply richer seeds to the
// same resolver rather than introducing a second assembly path.
// ---------------------------------------------------------------------------

export const automaticNpcBuildSeedSchema = z.object({
  name: z.string().trim().min(1),
  speciesId: z.string().min(1),
  classId: z.string().min(1).optional(),
  level: builderLevelSchema,
  /** Required — finalSubmit validation requires an alignment. */
  alignment: alignmentSchema,
  /** Required — finalSubmit validation requires a gender. */
  gender: genderSchema,
  /** Selected NPC role. Omitted when the caller did not choose one. */
  npcTemplateId: npcTemplateIdSchema.optional(),
})

/**
 * Soft ordering for automatic choice fill. Never fails a build and never adds slots.
 * Skill, tool, and language lists keep the recommendation source on each id.
 */
export type AutomaticNpcBuildPreferences = {
  abilityPriority?: readonly Ability[]
  skills?: readonly SourcedRecommendation[]
  tools?: readonly SourcedRecommendation[]
  languages?: readonly SourcedRecommendation[]
  weapons?: readonly SourcedRecommendation[]
  armor?: readonly SourcedRecommendation[]
  equipmentPreferences?: readonly NpcEquipmentPreferenceEntry[]
}

export const automaticNpcBuildAbilityPrioritySchema = z.array(abilitySchema).length(6)

export type AutomaticNpcBuildSeed = z.infer<typeof automaticNpcBuildSeedSchema>

/**
 * Validates seed content against the build context independently of any UI:
 * callers may not source options through campaign pickers (future templates),
 * so unavailable species/class ids and out-of-bounds levels are rejected here
 * with the existing builder issue codes.
 */
export function validateAutomaticNpcBuildSeed(
  seed: AutomaticNpcBuildSeed,
  context: CharacterBuildContext,
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []
  const available = resolvePlayableBuilderContent(context)

  if (!available.species.some((entry) => entry.id === seed.speciesId)) {
    issues.push(
      validationIssue(
        'species_not_in_catalog',
        characterBuilderValidationMessages.speciesNotInCatalog(),
        { path: 'species.speciesId', stepId: 'species' },
      ),
    )
  }

  if (isClassProgressionApplicable(seed.level)) {
    if (!seed.classId) {
      issues.push(
        validationIssue('class_required', characterBuilderValidationMessages.classRequired(), {
          path: 'class.classId',
          stepId: 'class',
        }),
      )
    } else if (!available.classes.some((entry) => entry.id === seed.classId)) {
      issues.push(
        validationIssue(
          'class_not_in_catalog',
          characterBuilderValidationMessages.classNotInCatalog(),
          { path: 'class.classId', stepId: 'class' },
        ),
      )
    }
  } else if (seed.classId) {
    issues.push(
      validationIssue(
        'class_not_permitted_at_level_zero',
        characterBuilderValidationMessages.classNotPermittedAtLevelZero(),
        { path: 'class.classId', stepId: 'class' },
      ),
    )
  }

  issues.push(
    ...validateBuilderCharacterLevel({
      level: seed.level,
      characterKind: context.characterKind,
      rulesScope: context.rulesScope,
      characterCreationRules: context.characterCreationRules,
    }),
  )

  return issues
}
