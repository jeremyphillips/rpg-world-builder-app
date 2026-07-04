import { defineMessage } from '../../../validation/define-message'

/** `Choose either {optionA} or {optionB}.` — local until a second domain needs it. */
const exclusiveEitherCopy = (optionA: string, optionB: string) =>
  `Choose either ${optionA} or ${optionB}.`

// ---------------------------------------------------------------------------
// Character validation messages (tier 2 domain catalog).
// Rules describing valid character data — reusable across builder, sheet,
// level-up, import, and runtime validation. Surface-specific workflow copy
// belongs in future characterBuilder / characterSheetForm / characterLevelUp
// catalogs (see docs/validation-messages.md).
// ---------------------------------------------------------------------------

export const characterValidationMessages = {
  duplicateClass: defineMessage(
    'validation.character.duplicateClass',
    () => 'A character cannot include the same class more than once.',
  ),
  toolProficiencyExclusiveTarget: defineMessage(
    'validation.character.toolProficiencyExclusiveTarget',
    () => exclusiveEitherCopy('a tool', 'a tool category'),
  ),
  weaponProficiencyExclusiveTarget: defineMessage(
    'validation.character.weaponProficiencyExclusiveTarget',
    () => exclusiveEitherCopy('a weapon', 'a weapon category'),
  ),
  selectionSourceIdRequired: defineMessage(
    'validation.character.selectionSourceIdRequired',
    () => 'Choose a source, or set the source kind to manual.',
  ),
}
