import type { CreatureMovementDefinition, Monster } from '@rpg/contracts'

import {
  movementAlternativeFormToSchema,
  movementRowsToRecordForPreview,
  type MovementAlternativeFormValues,
  type MovementRowDraftFormValues,
} from '../../lib/forms/fields/content-movement-form-fields'

export function monsterMovementDefinitionFromForm(
  movement: MovementRowDraftFormValues[] | undefined,
  movementAlternative?: MovementAlternativeFormValues,
): CreatureMovementDefinition {
  return {
    movement: movementRowsToRecordForPreview(movement ?? []),
    movementAlternative: movementAlternativeFormToSchema(movementAlternative),
  }
}

export function monsterMovementDefinitionFromRecord(
  monster: Pick<Monster, 'movement' | 'movementAlternative'>,
): CreatureMovementDefinition {
  return {
    movement: monster.movement,
    movementAlternative: monster.movementAlternative,
  }
}
