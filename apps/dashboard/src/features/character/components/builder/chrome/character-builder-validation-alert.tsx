import { characterBuilderValidationMessages, formatFieldMessage } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Text } from '@rpg/ui'

import {
  characterBuilderValidationAlertListClasses,
  characterBuilderValidationAlertRootClasses,
} from './character-builder-validation-alert.variants'

export type CharacterBuilderValidationAlertProps = {
  issues: CharacterBuildValidationIssue[]
  heading?: string
}

const DEFAULT_HEADING = formatFieldMessage(
  characterBuilderValidationMessages.completeRequiredFields(),
)

export function CharacterBuilderValidationAlert({
  issues,
  heading = DEFAULT_HEADING,
}: CharacterBuilderValidationAlertProps) {
  if (issues.length === 0) return null

  const displayHeading = formatFieldMessage(heading)

  return (
    <div role="alert" className={characterBuilderValidationAlertRootClasses}>
      <Text variant="destructive" className="font-medium">
        {displayHeading}
      </Text>
      <ul className={characterBuilderValidationAlertListClasses}>
        {issues.map((issue) => (
          <li key={`${issue.code}-${issue.path ?? issue.choiceSetId ?? issue.message}`}>
            {formatFieldMessage(issue.message)}
          </li>
        ))}
      </ul>
    </div>
  )
}
