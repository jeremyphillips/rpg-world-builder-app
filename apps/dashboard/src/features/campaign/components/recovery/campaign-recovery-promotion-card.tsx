import { Link } from 'react-router-dom'
import { ButtonLink } from '@rpg/ui'

import { PromotionCard } from '@/components/layout/promotion-card'

import type { CampaignRecoveryPromotion } from '../../lib/recovery/campaign-recovery-promotions.lib'
import { isCampaignOnboardingPrimaryAction } from '../../lib/onboarding/campaign-onboarding-copy'

type CampaignRecoveryPromotionCardProps = {
  promotion: CampaignRecoveryPromotion
}

export function CampaignRecoveryPromotionCard({ promotion }: CampaignRecoveryPromotionCardProps) {
  const variant =
    promotion.actionLabel && isCampaignOnboardingPrimaryAction(promotion.actionLabel)
      ? 'default'
      : 'outline'

  const action =
    promotion.href && promotion.actionLabel ? (
      <ButtonLink
        link={
          promotion.kind === 'pending_invite' ? (
            <a href={promotion.href} />
          ) : (
            <Link to={promotion.href} />
          )
        }
        variant={variant}
        size="sm"
      >
        {promotion.actionLabel}
      </ButtonLink>
    ) : null

  return (
    <PromotionCard
      tone={promotion.tone === 'destructive' ? 'warning' : promotion.tone}
      title={promotion.title}
      description={promotion.body}
      meta={promotion.meta}
      actions={action}
    />
  )
}

/** @deprecated Use {@link CampaignRecoveryPromotionCard}. */
export const FinishJoiningCampaignCard = CampaignRecoveryPromotionCard
