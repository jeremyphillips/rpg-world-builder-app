import { characterBuilderValidationMessages, formatFieldMessage } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Alert } from '@rpg/ui'

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
    <Alert variant="destructive" title={displayHeading}>
      <ul className="mt-2 list-none space-y-3 pl-0 text-sm text-destructive">
        {issues.map((issue) => (
          <li key={`${issue.code}-${issue.path ?? issue.choiceSetId ?? issue.message}`}>
            {formatFieldMessage(issue.message)}
          </li>
        ))}
      </ul>
    </Alert>
  )
}
