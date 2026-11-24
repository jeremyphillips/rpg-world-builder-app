import { defineMessage } from '../../../../validation/define-message'
import { getMonsterActionKindLabel } from '../../../vocab/monster-action-kind'

// ---------------------------------------------------------------------------
// Monster action occurrence / repeatability (tier 2).
// Shared by publish refine, acquisition policy, and content add menus.
// ---------------------------------------------------------------------------

export const monsterActionOccurrenceMessages = {
  primarySpellcastingDuplicate: defineMessage(
    'validation.monsterActionOccurrence.primarySpellcastingDuplicate',
    () => 'Only one Spellcasting profile is allowed.',
  ),
  singletonKind: defineMessage<{ kind: string }>(
    'validation.monsterActionOccurrence.singletonKind',
    ({ kind }) => `Only one ${getMonsterActionKindLabel(kind)} action is allowed.`,
  ),
  weaponEquipmentDuplicate: defineMessage(
    'validation.monsterActionOccurrence.weaponEquipmentDuplicate',
    () => 'Each equipped weapon can have only one weapon action.',
  ),
  naturalFormDuplicate: defineMessage(
    'validation.monsterActionOccurrence.naturalFormDuplicate',
    () => 'Each natural attack form can be defined only once.',
  ),
  constrictPresetDuplicate: defineMessage(
    'validation.monsterActionOccurrence.constrictPresetDuplicate',
    () => 'Only one Constrict action is allowed.',
  ),
}
