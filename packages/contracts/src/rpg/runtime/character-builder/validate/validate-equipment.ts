import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import type { CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import {
  formatMagicItemGrantIncompleteLabel,
  magicItemGrantIncompleteIssueCode,
  resolveUnresolvedMagicItemGrantIssues,
} from '../resolvers/equipment/resolve-equipment-magic-item-grant-step-issues'

import { validationIssue } from './issue'
import type { CharacterBuildValidationIssue } from './types'

export function validateEquipment(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): CharacterBuildValidationIssue[] {
  return resolveUnresolvedMagicItemGrantIssues({ draft, context }).map((issue) =>
    validationIssue(
      magicItemGrantIncompleteIssueCode(issue.allowanceId),
      characterBuilderValidationMessages.magicItemGrantIncomplete({
        rarityLabel: formatMagicItemGrantIncompleteLabel(issue.rarity),
        remaining: issue.remaining,
      }),
      {
        path: 'equipment.magicItemSelections',
        stepId: 'equipment',
        allowanceId: issue.allowanceId,
      },
    ),
  )
}
