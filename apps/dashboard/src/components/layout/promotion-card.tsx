import type { ReactNode } from 'react'
import { Text } from '@rpg/ui'

import { promotionCardRootVariants, promotionCardTitleVariants } from './promotion-card.variants'

export type PromotionCardProps = {
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  tone?: 'default' | 'warning'
  emphasis?: 'default' | 'subtle'
}

/** Shared chrome for dashboard home promotion surfaces (invites, onboarding recovery). */
export function PromotionCard({
  title,
  description,
  meta,
  actions,
  tone = 'default',
  emphasis = 'default',
}: PromotionCardProps) {
  return (
    <div className={promotionCardRootVariants({ tone, emphasis })}>
      <div className="flex flex-col gap-2">
        <div className={promotionCardTitleVariants({ tone })}>{title}</div>
        {description ? <Text variant="small">{description}</Text> : null}
        {meta ? (
          <Text variant="small" className="text-muted-foreground">
            {meta}
          </Text>
        ) : null}
        {actions ? <div className="flex flex-wrap gap-2 pt-1">{actions}</div> : null}
      </div>
    </div>
  )
}
