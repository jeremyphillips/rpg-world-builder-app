'use client'

import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

import { PromotionCard } from '@/components/layout/promotion-card'

import type { CampaignRecoveryPromotion } from '../lib/campaign-recovery-promotions.lib'

type CampaignRecoveryPromotionCardProps = {
  promotion: CampaignRecoveryPromotion
}

export function CampaignRecoveryPromotionCard({ promotion }: CampaignRecoveryPromotionCardProps) {
  const actionClassName =
    promotion.kind === 'pending_invite'
      ? buttonVariants({ size: 'sm' })
      : buttonVariants({ variant: 'outline', size: 'sm' })

  const action =
    promotion.href && promotion.actionLabel ? (
      promotion.kind === 'pending_invite' ? (
        <a href={promotion.href} className={actionClassName}>
          {promotion.actionLabel}
        </a>
      ) : (
        <Link to={promotion.href} className={actionClassName}>
          {promotion.actionLabel}
        </Link>
      )
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
