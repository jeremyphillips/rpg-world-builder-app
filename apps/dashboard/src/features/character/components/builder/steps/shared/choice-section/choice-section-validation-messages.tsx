import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Text } from '@rpg/ui'

import { choiceSectionValidationListClasses } from './choice-section.variants'

export type ChoiceSectionValidationMessagesProps = {
  issues: readonly CharacterBuildValidationIssue[]
}

export function ChoiceSectionValidationMessages({ issues }: ChoiceSectionValidationMessagesProps) {
  if (issues.length === 0) return null

  return (
    <ul className={choiceSectionValidationListClasses} role="alert">
      {issues.map((issue) => (
        <li key={`${issue.code}-${issue.choiceSetId ?? issue.path ?? issue.message}`}>
          <Text variant="destructive">{issue.message}</Text>
        </li>
      ))}
    </ul>
  )
}
