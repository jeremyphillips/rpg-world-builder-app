import { ButtonLink, Card, CardContent, resolveSurfaceActionButtonSize, Text } from '@rpg/ui'

import type { CampaignRecoveryPromotion } from '@/features/campaign'

const PROMOTION_DENSITY = 'comfortable' as const

type CampaignInvitationCardProps = {
  promotion: CampaignRecoveryPromotion
}

export function CampaignInvitationCard({ promotion }: CampaignInvitationCardProps) {
  const actionSize = resolveSurfaceActionButtonSize(PROMOTION_DENSITY)

  return (
    <Card
      density={PROMOTION_DENSITY}
      header={{ title: promotion.title, description: promotion.body }}
      footer={
        promotion.href && promotion.actionLabel ? (
          <ButtonLink link={<a href={promotion.href} />} size={actionSize}>
            {promotion.actionLabel}
          </ButtonLink>
        ) : null
      }
    >
      {promotion.meta ? (
        <CardContent>
          <Text variant="small" className="text-muted-foreground">
            {promotion.meta}
          </Text>
        </CardContent>
      ) : null}
    </Card>
  )
}
