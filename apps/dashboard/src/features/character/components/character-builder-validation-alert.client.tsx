'use client'

import { formatFieldMessage, type CharacterBuildValidationIssue } from '@rpg/contracts'
import { Text } from '@rpg/ui'

export type CharacterBuilderValidationAlertProps = {
  issues: CharacterBuildValidationIssue[]
  heading?: string
}

const DEFAULT_HEADING = 'Fix the following before continuing:'

export function CharacterBuilderValidationAlert({
  issues,
  heading = DEFAULT_HEADING,
}: CharacterBuilderValidationAlertProps) {
  if (issues.length === 0) return null

  const displayHeading = formatFieldMessage(heading)

  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3"
    >
      <Text variant="destructive" className="font-medium">
        {displayHeading}
      </Text>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-destructive">
        {issues.map((issue) => (
          <li key={`${issue.code}-${issue.path ?? issue.choiceSetId ?? issue.message}`}>
            {formatFieldMessage(issue.message)}
          </li>
        ))}
      </ul>
    </div>
  )
}
