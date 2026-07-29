'use client'

import { Link } from 'react-router-dom'
import type { CharacterRosterStatus } from '@rpg/contracts'
import {
  Badge,
  buttonVariants,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Text,
} from '@rpg/ui'

import { resolveCharacterRosterStatusPresentation } from '../lib/campaign-roster-presentation'
import { CHARACTER_CARD_CAMPAIGN_LABEL } from '../lib/display/character-display'
import type { CharacterListCardData } from './character-list-card.lib'

export type CharacterListCardProps = {
  card: CharacterListCardData
  detailHref: string
  campaignLabel?: string
  rosterStatus?: CharacterRosterStatus
}

/** Roster card for a character summary row — name, summary line, and detail link. */
export function CharacterListCard({
  card,
  detailHref,
  campaignLabel = CHARACTER_CARD_CAMPAIGN_LABEL,
  rosterStatus,
}: CharacterListCardProps) {
  const rosterPresentation = rosterStatus
    ? resolveCharacterRosterStatusPresentation(rosterStatus)
    : null

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{card.name}</CardTitle>
          {rosterPresentation ? (
            <Badge appearance={rosterPresentation.appearance} tone={rosterPresentation.tone}>
              {rosterPresentation.label}
            </Badge>
          ) : null}
        </div>
        <CardDescription>{card.summary}</CardDescription>
        {card.campaign ? (
          <Text variant="small" className="text-muted-foreground">
            {campaignLabel}: {card.campaign.name}
          </Text>
        ) : null}
      </CardHeader>
      <CardFooter className="mt-auto">
        <Link to={detailHref} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          View
        </Link>
      </CardFooter>
    </Card>
  )
}
