'use client'

import type {
  CharacterCampaignBlockingIssue,
  CharacterCampaignWarning,
  CharacterCampaignWarningCategory,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import {
  formatBlockingReason,
  formatComboboxBlockingDescription,
} from '../lib/campaign-invite-eligibility-display'
import { WARNING_CATEGORY_LABELS } from '../lib/campaign-invite-onboarding.lib'

export type CampaignInviteEligibilityAlertProps = {
  blockingIssues: readonly CharacterCampaignBlockingIssue[]
  warnings?: readonly CharacterCampaignWarning[]
  heading?: string
}

function groupWarningsByCategory(
  warnings: readonly CharacterCampaignWarning[],
): Partial<Record<CharacterCampaignWarningCategory, CharacterCampaignWarning[]>> {
  return warnings.reduce<
    Partial<Record<CharacterCampaignWarningCategory, CharacterCampaignWarning[]>>
  >((groups, warning) => {
    const current = groups[warning.category] ?? []
    groups[warning.category] = [...current, warning]
    return groups
  }, {})
}

export function CampaignInviteEligibilityAlert({
  blockingIssues,
  warnings = [],
  heading = 'This build cannot join the campaign yet:',
}: CampaignInviteEligibilityAlertProps) {
  if (blockingIssues.length === 0) return null

  const summary = formatComboboxBlockingDescription(blockingIssues)
  const warningGroups = groupWarningsByCategory(warnings)

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
      {Object.keys(warningGroups).length > 0 ? (
        <div className="mt-4 space-y-3 border-t border-destructive-muted pt-3">
          <Text variant="destructive" className="text-sm font-medium">
            Review campaign differences
          </Text>
          {Object.entries(warningGroups).map(([category, categoryWarnings]) => (
            <div key={category} className="space-y-1">
              <Text variant="destructive" className="text-sm font-medium">
                {WARNING_CATEGORY_LABELS[category as CharacterCampaignWarningCategory]}
              </Text>
              <ul className="list-disc pl-5 text-sm text-destructive">
                {categoryWarnings?.map((warning) => (
                  <li key={`${warning.category}:${warning.contentId}`}>{warning.label}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
