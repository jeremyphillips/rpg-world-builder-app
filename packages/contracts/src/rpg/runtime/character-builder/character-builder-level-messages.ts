import { defineMessage } from '../../../validation/define-message'

// ---------------------------------------------------------------------------
// Character builder level UI messages — workflow chrome for the level control
// in shell chrome. Distinct from validation messages.
// ---------------------------------------------------------------------------

export const characterBuilderLevelMessages = {
  fieldLabel: defineMessage('validation.characterBuilder.level.fieldLabel', () => 'Level'),
  fixedHelper: defineMessage<{ startingLevel: number }>(
    'validation.characterBuilder.level.fixedHelper',
    ({ startingLevel }) => `Campaign entry level (${startingLevel}).`,
  ),
  selectableHelper: defineMessage<{ maxLevel: number }>(
    'validation.characterBuilder.level.selectableHelper',
    ({ maxLevel }) => `Choose a starting level up to ${maxLevel}.`,
  ),
  changeConfirmationHeadline: defineMessage(
    'validation.characterBuilder.level.changeConfirmationHeadline',
    () => 'Change level?',
  ),
  changeConfirmationDescription: defineMessage(
    'validation.characterBuilder.level.changeConfirmationDescription',
    () => 'Changing level will remove choices that are no longer available at the new level.',
  ),
  removalSummary: defineMessage<{ label: string; count: number }>(
    'validation.characterBuilder.level.removalSummary',
    ({ label, count }) =>
      count === 1 ? `${label}: 1 selection removed` : `${label}: ${count} selections removed`,
  ),
  changeConfirmLabel: defineMessage(
    'validation.characterBuilder.level.changeConfirmLabel',
    () => 'Change level',
  ),
  changeCancelLabel: defineMessage(
    'validation.characterBuilder.level.changeCancelLabel',
    () => 'Keep current level',
  ),
}
