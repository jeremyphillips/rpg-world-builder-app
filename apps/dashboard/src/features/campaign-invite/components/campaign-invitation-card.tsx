import { ButtonLink } from '@rpg/ui'

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
          <ButtonLink link={<a href={promotion.href} />} size="sm">
            {promotion.actionLabel}
          </ButtonLink>
        ) : null
      }
    />
  )
}
