'use client'

import type { CharacterCampaignWarning, CharacterCampaignWarningCategory } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import {
  groupWarningsByCategory,
  WARNING_CATEGORY_LABELS,
} from '../../lib/onboarding/campaign-character-eligibility-display'

const WARNING_REVIEW_HEADING = 'Review campaign differences'

const WARNING_REVIEW_DESCRIPTION =
  "This character can join, but some existing choices are not available under this campaign's current rules."

export type CampaignCharacterWarningReviewProps = {
  warnings: readonly CharacterCampaignWarning[]
  /** Standalone card for eligible characters; embedded section inside blocking alerts. */
  layout?: 'card' | 'embedded'
  tone?: 'default' | 'destructive'
}

export function CampaignCharacterWarningReview({
  warnings,
  layout = 'card',
  tone = 'default',
}: CampaignCharacterWarningReviewProps) {
  const warningGroups = groupWarningsByCategory(warnings)
  if (Object.keys(warningGroups).length === 0) return null

  const isDestructive = tone === 'destructive'
  const heading =
    layout === 'card' ? (
      <Heading variant="subsection" as="h3">
        {WARNING_REVIEW_HEADING}
      </Heading>
    ) : (
      <Text variant={isDestructive ? 'destructive' : 'small'} className="text-sm font-medium">
        {WARNING_REVIEW_HEADING}
      </Text>
    )

  const categoryHeadingClassName = isDestructive ? 'text-sm font-medium' : 'font-medium'
  const listClassName = isDestructive
    ? 'list-disc pl-5 text-sm text-destructive'
    : 'list-disc pl-5 text-sm text-muted-foreground'

  const content = (
    <>
      {heading}
      {layout === 'card' ? <Text variant="muted">{WARNING_REVIEW_DESCRIPTION}</Text> : null}
      {Object.entries(warningGroups).map(([category, categoryWarnings]) => (
        <div key={category} className={layout === 'card' ? 'flex flex-col gap-1' : 'space-y-1'}>
          <Text
            variant={isDestructive ? 'destructive' : 'small'}
            className={categoryHeadingClassName}
          >
            {WARNING_CATEGORY_LABELS[category as CharacterCampaignWarningCategory]}
          </Text>
          <ul className={listClassName}>
            {categoryWarnings?.map((warning) => (
              <li key={`${warning.category}:${warning.contentId}`}>{warning.label}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )

  if (layout === 'embedded') {
    return <div className="space-y-3">{content}</div>
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted p-4">
      {content}
    </div>
  )
}
