import type { CharacterCampaignBlockingIssue, CharacterCampaignWarning } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  formatBlockingReason,
  formatComboboxBlockingDescription,
} from '../../lib/onboarding/campaign-character-eligibility-display'
import { CampaignCharacterWarningReview } from './campaign-character-warning-review'

export type CampaignCharacterEligibilityAlertProps = {
  blockingIssues: readonly CharacterCampaignBlockingIssue[]
  warnings?: readonly CharacterCampaignWarning[]
  heading?: string
}

export function CampaignCharacterEligibilityAlert({
  blockingIssues,
  warnings = [],
  heading = 'This build cannot join the campaign yet:',
}: CampaignCharacterEligibilityAlertProps) {
  if (blockingIssues.length === 0) return null

  const summary = formatComboboxBlockingDescription(blockingIssues)

  return (
    <div
      role="alert"
      className="rounded-md border border-destructive-muted bg-destructive-subtle px-4 py-3"
    >
      <Text variant="destructive" className="font-medium">
        {heading}
      </Text>
      {summary ? (
        <Text variant="destructive" className="mt-2 text-sm">
          {summary}
        </Text>
      ) : null}
      {blockingIssues.length > 1 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-destructive">
          {blockingIssues.map((issue) => (
            <li key={`${issue.code}-${'contentId' in issue ? issue.contentId : issue.code}`}>
              {formatBlockingReason(issue)}
            </li>
          ))}
        </ul>
      ) : null}
      {warnings.length > 0 ? (
        <div className="mt-4 space-y-3 border-t border-destructive-muted pt-3">
          <CampaignCharacterWarningReview
            warnings={warnings}
            layout="embedded"
            tone="destructive"
          />
        </div>
      ) : null}
    </div>
  )
}
