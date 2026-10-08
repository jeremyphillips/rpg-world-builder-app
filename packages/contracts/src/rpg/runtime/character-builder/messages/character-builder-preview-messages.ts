import { defineMessage } from '../../../../validation/define-message'
import { getContentTypeCapitalizedSentenceLabel } from '../../../content/lib/content-type-terms'

// ---------------------------------------------------------------------------
// Character builder preview messages — advisory copy for the live preview
// panel. Distinct from validation messages (blocking issues / form errors).
// See docs/validation-messages.md.
// ---------------------------------------------------------------------------

export const characterBuilderPreviewMessages = {
  nameNotSet: defineMessage(
    'validation.characterBuilderPreview.nameNotSet',
    () => 'Name is not set.',
  ),
  speciesNotSelected: defineMessage(
    'validation.characterBuilderPreview.speciesNotSelected',
    () => `${getContentTypeCapitalizedSentenceLabel('species')} is not selected.`,
  ),
  classNotSelected: defineMessage(
    'validation.characterBuilderPreview.classNotSelected',
    () => `${getContentTypeCapitalizedSentenceLabel('classes')} is not selected.`,
  ),
  requiredChoicesIncomplete: defineMessage(
    'validation.characterBuilderPreview.requiredChoicesIncomplete',
    () => 'Some required choices are incomplete.',
  ),
  unarmoredDefenseNotModeled: defineMessage<{ featureName: string }>(
    'validation.characterBuilderPreview.unarmoredDefenseNotModeled',
    ({ featureName }) => `${featureName} may change AC; not reflected in preview.`,
  ),
}
