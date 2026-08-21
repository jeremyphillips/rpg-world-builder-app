import { buttonVariants } from '@rpg/ui'

import { PromotionCard } from '@/components/layout/promotion-card'

import type { CampaignRecoveryPromotion } from '@/features/campaign'

type CampaignInvitationCardProps = {
  promotion: CampaignRecoveryPromotion
}

export function CampaignInvitationCard({ promotion }: CampaignInvitationCardProps) {
  return (
    <PromotionCard
      tone="default"
      title={promotion.title}
      description={promotion.body}
      meta={promotion.meta}
      actions={
        promotion.href && promotion.actionLabel ? (
          <a href={promotion.href} className={buttonVariants({ size: 'sm' })}>
            {promotion.actionLabel}
          </a>
        ) : null
      }
    />
  )
}
