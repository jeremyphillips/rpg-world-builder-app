import {
  defineMessage,
  formatFieldMessage,
  type MessageDef,
} from '../../../validation/define-message'

import type { AbilityGenerationMethod } from './ability-generation'

// ---------------------------------------------------------------------------
// Ability generation method registry — display metadata and capability flags.
// Logic validation stays in ability-generation.ts / validate-step-fields.ts;
// dashboard maps method id → assignment UI component.
// ---------------------------------------------------------------------------

export type AbilityGenerationMethodDefinition = {
  id: AbilityGenerationMethod
  displayName: MessageDef<void>
  assignmentDescription?: MessageDef<void>
  /** Assignment must use each value from rules.standardArray exactly once. */
  usesFixedScorePool: boolean
}

export const ABILITY_GENERATION_METHODS_REGISTRY = [
  {
    id: 'standard-array',
    displayName: defineMessage(
      'validation.characterBuilder.abilityMethod.fixedScores',
      () => 'Fixed scores',
    ),
    assignmentDescription: defineMessage(
      'validation.characterBuilder.abilityMethod.fixedScoresAssignment',
      () => 'Drag each score onto an ability, or choose scores manually.',
    ),
    usesFixedScorePool: true,
  },
  {
    id: 'manual',
    displayName: defineMessage(
      'validation.characterBuilder.abilityMethod.customScores',
      () => 'Custom scores',
    ),
    usesFixedScorePool: false,
  },
] as const satisfies readonly AbilityGenerationMethodDefinition[]

const registryById = new Map(
  ABILITY_GENERATION_METHODS_REGISTRY.map((definition) => [definition.id, definition]),
)

export function getAbilityGenerationMethodDefinition(
  id: AbilityGenerationMethod,
): AbilityGenerationMethodDefinition {
  const definition = registryById.get(id)
  if (!definition) {
    throw new Error(`Unknown ability generation method: ${id}`)
  }
  return definition
}

export function getAbilityGenerationMethodDisplayName(
  id: AbilityGenerationMethod | undefined,
): string {
  if (!id) return 'Not set'
  return formatFieldMessage(getAbilityGenerationMethodDefinition(id).displayName())
}

export function getAbilityGenerationMethodAssignmentDescription(
  id: AbilityGenerationMethod,
): string | undefined {
  const description = getAbilityGenerationMethodDefinition(id).assignmentDescription
  return description ? formatFieldMessage(description()) : undefined
}
