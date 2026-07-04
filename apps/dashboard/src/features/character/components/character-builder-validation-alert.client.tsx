'use client'

import type { CharacterBuildValidationIssue } from '@rpg/contracts'
import { Text } from '@rpg/ui'

export type CharacterBuilderValidationAlertProps = {
  issues: CharacterBuildValidationIssue[]
}

export function CharacterBuilderValidationAlert({ issues }: CharacterBuilderValidationAlertProps) {
  if (issues.length === 0) return null

  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3"
    >
      <Text variant="destructive" className="font-medium">
        Fix the following before continuing:
      </Text>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-destructive">
        {issues.map((issue) => (
          <li key={`${issue.code}-${issue.path ?? issue.choiceSetId ?? issue.message}`}>
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
