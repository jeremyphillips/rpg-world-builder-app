import type { CharacterBuilderStepId } from '@rpg/contracts/rpg/character-builder'

export const BUILDER_STEP_FORM_IDS = {
  identity: 'character-builder-identity-form',
  abilities: 'character-builder-abilities-form',
} as const satisfies Partial<Record<CharacterBuilderStepId, string>>

export function getBuilderStepFormId(stepId: CharacterBuilderStepId): string | undefined {
  return BUILDER_STEP_FORM_IDS[stepId as keyof typeof BUILDER_STEP_FORM_IDS]
}

export function isBuilderFormStep(stepId: CharacterBuilderStepId): boolean {
  return stepId in BUILDER_STEP_FORM_IDS
}
