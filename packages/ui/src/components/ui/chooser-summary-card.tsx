'use client'

import { Button } from './button.client'
import { Eyebrow } from './eyebrow'
import { Text } from './text'
import type { RadioCardDensity } from './radio-card.client'
import {
  chooserSummaryCardBodyVariants,
  chooserSummaryCardChangeLinkClasses,
  chooserSummaryCardDescriptionVariants,
  chooserSummaryCardEyebrowRowClasses,
  chooserSummaryCardPrimaryCopyVariants,
  chooserSummaryCardShellClasses,
  chooserSummaryCardTitleVariants,
} from './chooser-summary-card.variants'

export type ChooserSummaryCardProps = {
  eyebrow: string
  changeLabel: string
  title: string
  description?: string
  onChange: () => void
  density?: RadioCardDensity
}

export function ChooserSummaryCard({
  eyebrow,
  changeLabel,
  title,
  description,
  onChange,
  density = 'default',
}: ChooserSummaryCardProps) {
  return (
    <article className={chooserSummaryCardShellClasses}>
      <div className={chooserSummaryCardBodyVariants({ density })}>
        <div className={chooserSummaryCardEyebrowRowClasses}>
          <Eyebrow size={density === 'compact' ? 'xs' : 'sm'}>{eyebrow}</Eyebrow>
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
        <div className={chooserSummaryCardPrimaryCopyVariants({ density })}>
          <Text as="h3" className={chooserSummaryCardTitleVariants({ density })}>
            {title}
          </Text>
          {description ? (
            <Text as="p" className={chooserSummaryCardDescriptionVariants({ density })}>
              {description}
            </Text>
          ) : null}
        </div>
      </div>
    </article>
  )
}
