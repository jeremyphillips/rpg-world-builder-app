import { characterBuilderValidationMessages, formatFieldMessage } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'
import { Collapsible, CollapsibleContent, CollapsibleTrigger, Text } from '@rpg/ui'

import {
  resolveValidationIssuePresentation,
  shouldInlineValidationTechnicalDetails,
} from '../../../lib/builder/resolve-validation-issue-presentation.lib'
import {
  characterBuilderValidationAlertContextClasses,
  characterBuilderValidationAlertListClasses,
  characterBuilderValidationAlertRootClasses,
  characterBuilderValidationAlertTechnicalContentClasses,
  characterBuilderValidationAlertTechnicalInlineClasses,
  characterBuilderValidationAlertTechnicalTriggerClasses,
} from './character-builder-validation-alert.variants'

export type CharacterBuilderValidationAlertProps = {
  issues: CharacterBuildValidationIssue[]
  heading?: string
}

const DEFAULT_HEADING = formatFieldMessage(
  characterBuilderValidationMessages.completeRequiredFields(),
)

function ValidationIssueListItem({ issue }: { issue: CharacterBuildValidationIssue }) {
  const { message, contextLabel, technicalDetails } = resolveValidationIssuePresentation(issue)
  const showTechnicalInline = shouldInlineValidationTechnicalDetails() && technicalDetails

  return (
    <li>
      <div>{message}</div>
      {contextLabel ? (
        <Text as="div" variant="muted" className={characterBuilderValidationAlertContextClasses}>
          {contextLabel}
        </Text>
      ) : null}
      {showTechnicalInline ? (
        <div className={characterBuilderValidationAlertTechnicalInlineClasses}>
          {technicalDetails}
        </div>
      ) : null}
      {!showTechnicalInline && technicalDetails ? (
        <Collapsible>
          <CollapsibleTrigger className={characterBuilderValidationAlertTechnicalTriggerClasses}>
            Technical details
          </CollapsibleTrigger>
          <CollapsibleContent className={characterBuilderValidationAlertTechnicalContentClasses}>
            {technicalDetails}
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </li>
  )
}

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
          <ValidationIssueListItem
            key={`${issue.code}-${issue.path ?? issue.choiceSetId ?? issue.message}`}
            issue={issue}
          />
        ))}
      </ul>
    </div>
  )
}
