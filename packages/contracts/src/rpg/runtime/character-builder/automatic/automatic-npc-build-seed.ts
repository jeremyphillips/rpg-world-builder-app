import { z } from 'zod'

import { absoluteLevelSchema } from '../../../primitives/level'
import { alignmentSchema } from '../../../vocab/alignment'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import type { CharacterBuildContext } from '../context'
import { resolveAvailableContent } from '../preview/resolve-available-content'
import { validateBuilderCharacterLevel } from '../progression/builder-level'
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
  classId: z.string().min(1),
  level: absoluteLevelSchema,
  /** Required — finalSubmit validation requires an alignment. */
  alignment: alignmentSchema,
})

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
  const available = resolveAvailableContent(context)

  if (!available.species.some((entry) => entry.id === seed.speciesId)) {
    issues.push(
      validationIssue(
        'species_not_in_catalog',
        characterBuilderValidationMessages.speciesNotInCatalog(),
        { path: 'species.speciesId', stepId: 'species' },
      ),
    )
  }

  if (!available.classes.some((entry) => entry.id === seed.classId)) {
    issues.push(
      validationIssue(
        'class_not_in_catalog',
        characterBuilderValidationMessages.classNotInCatalog(),
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
