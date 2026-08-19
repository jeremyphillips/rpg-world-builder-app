'use client'

import { Button } from './button.client'
import { Eyebrow } from './eyebrow'
import { Text } from './text'
import { cn } from '../../lib/utils'
import type { RadioCardDensity } from './radio-card.client'
import {
  chooserSummaryCardBodyVariants,
  chooserSummaryCardChangeLinkClasses,
  chooserSummaryCardDescriptionVariants,
  chooserSummaryCardEyebrowRowClasses,
  chooserSummaryCardPrimaryCopyVariants,
  chooserSummaryCardShellClasses,
  chooserSummaryCardTitleButtonClasses,
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

function buildChooserSummaryTitleAriaLabel(title: string, changeLabel: string): string {
  return `${title}, ${changeLabel}`
}

export function ChooserSummaryCard({
  eyebrow,
  changeLabel,
  title,
  description,
  onChange,
  density = 'default',
}: ChooserSummaryCardProps) {
  const titleAriaLabel = buildChooserSummaryTitleAriaLabel(title, changeLabel)

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
          <button
            type="button"
            className={cn(
              chooserSummaryCardTitleVariants({ density }),
              chooserSummaryCardTitleButtonClasses,
            )}
            aria-label={titleAriaLabel}
            onClick={onChange}
          >
            {title}
          </button>
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
