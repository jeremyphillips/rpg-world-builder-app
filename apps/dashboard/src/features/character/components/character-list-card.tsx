import { Link } from 'react-router-dom'
import type { CharacterRosterStatus } from '@rpg/contracts'
import {
  Badge,
  buttonVariants,
  cn,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Text,
} from '@rpg/ui'

import { ContentMediaImage } from '@/features/media/components/content-media-image'
import { CampaignDisplayName, buildCampaignDisplay } from '@/features/campaign'

import { resolveCharacterRosterStatusPresentation } from '../lib/campaign-roster-presentation'
import type { CharacterListCardData } from './character-list-card.lib'

export type CharacterListCardProps = {
  card: CharacterListCardData
  detailHref: string
  showCampaign?: boolean
  controllerLine?: string
  rosterStatus?: CharacterRosterStatus
}

/** Roster card for a character summary row — optional stacked art, name, summary, and detail link. */
export function CharacterListCard({
  card,
  detailHref,
  showCampaign = true,
  controllerLine,
  rosterStatus,
}: CharacterListCardProps) {
  const rosterPresentation = rosterStatus
    ? resolveCharacterRosterStatusPresentation(rosterStatus)
    : null

  return (
    <Card className="flex h-full flex-col overflow-hidden p-0">
      {card.displayImage ? (
        <ContentMediaImage display={card.displayImage} alt="" frame="builderCard" />
      ) : null}
      <CardHeader className={card.displayImage ? 'px-5 pb-3 pt-3' : undefined}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{card.name}</CardTitle>
          {rosterPresentation ? (
            <Badge appearance={rosterPresentation.appearance} tone={rosterPresentation.tone}>
              {rosterPresentation.label}
            </Badge>
          ) : null}
        </div>
        <CardDescription>{card.summary}</CardDescription>
        {controllerLine ? (
          <Text variant="small" className="text-muted-foreground">
            {controllerLine}
          </Text>
        ) : null}
        {showCampaign && card.campaign ? (
          <CampaignDisplayName
            display={buildCampaignDisplay({
              id: card.campaign.id,
              name: card.campaign.name,
              emblemUrl: card.campaign.emblemUrl,
            })}
            surface="inlineMuted"
          />
        ) : null}
      </CardHeader>
      <CardFooter className={cn('mt-auto', card.displayImage != null && 'px-5 pb-5')}>
        <Link to={detailHref} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          View
        </Link>
      </CardFooter>
    </Card>
  )
}
