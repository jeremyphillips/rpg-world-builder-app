import { Link } from 'react-router-dom'
import { Alert, ButtonLink, Card, CardContent, resolveSurfaceActionButtonSize, Text } from '@rpg/ui'

import type { CampaignRecoveryPromotion } from '../../lib/recovery/campaign-recovery-promotions.lib'
import { isCampaignOnboardingPrimaryAction } from '../../lib/onboarding/campaign-onboarding-copy'

const PROMOTION_DENSITY = 'comfortable' as const

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
        size={resolveSurfaceActionButtonSize(PROMOTION_DENSITY)}
      >
        {promotion.actionLabel}
      </ButtonLink>
    ) : null

  if (promotion.kind === 'reconnect_character') {
    return (
      <Alert
        variant="warning"
        density={PROMOTION_DENSITY}
        announcement="none"
        title={promotion.title}
        description={promotion.body}
        actions={action}
      />
    )
  }

  return (
    <Card
      density={PROMOTION_DENSITY}
      header={{ title: promotion.title, description: promotion.body }}
      footer={action}
    >
      {promotion.meta ? (
        <CardContent>
          <Text variant="small">{promotion.meta}</Text>
        </CardContent>
      ) : null}
    </Card>
  )
}

/** @deprecated Use {@link CampaignRecoveryPromotionCard}. */
export const FinishJoiningCampaignCard = CampaignRecoveryPromotionCard
