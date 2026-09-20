import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Text } from '@rpg/ui'

import { proficiencySectionValidationListClasses } from './proficiency-section.variants'

export type ProficiencySectionValidationMessagesProps = {
  issues: readonly CharacterBuildValidationIssue[]
}

export function ProficiencySectionValidationMessages({
  issues,
}: ProficiencySectionValidationMessagesProps) {
  if (issues.length === 0) return null

  return (
    <ul className={proficiencySectionValidationListClasses} role="alert">
      {issues.map((issue) => (
        <li key={`${issue.code}-${issue.choiceSetId ?? issue.path ?? issue.message}`}>
          <Text variant="destructive">{issue.message}</Text>
        </li>
      ))}
    </ul>
  )
}
