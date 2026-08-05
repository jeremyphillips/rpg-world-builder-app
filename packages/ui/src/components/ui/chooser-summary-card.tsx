'use client'

import { Button } from './button.client'
import { Eyebrow } from './eyebrow'
import { Text } from './text'
import {
  chooserSummaryCardBodyClasses,
  chooserSummaryCardChangeLinkClasses,
  chooserSummaryCardDescriptionClasses,
  chooserSummaryCardEyebrowRowClasses,
  chooserSummaryCardShellClasses,
  chooserSummaryCardTitleClasses,
} from './chooser-summary-card.variants'

export type ChooserSummaryCardProps = {
  eyebrow: string
  changeLabel: string
  title: string
  description?: string
  onChange: () => void
}

export function ChooserSummaryCard({
  eyebrow,
  changeLabel,
  title,
  description,
  onChange,
}: ChooserSummaryCardProps) {
  return (
    <article className={chooserSummaryCardShellClasses}>
      <div className={chooserSummaryCardBodyClasses}>
        <div className={chooserSummaryCardEyebrowRowClasses}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <Button
            type="button"
            variant="link"
            size="sm"
            className={chooserSummaryCardChangeLinkClasses}
            onClick={onChange}
          >
            {changeLabel}
          </Button>
        </div>
        <Text as="h3" className={chooserSummaryCardTitleClasses}>
          {title}
        </Text>
        {description ? (
          <Text as="p" className={chooserSummaryCardDescriptionClasses}>
            {description}
          </Text>
        ) : null}
      </div>
    </article>
  )
}
