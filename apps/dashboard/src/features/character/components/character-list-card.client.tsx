'use client'

import { Link } from 'react-router-dom'
import {
  buttonVariants,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Text,
} from '@rpg/ui'

import { CHARACTER_CARD_CAMPAIGN_LABEL } from '../lib/display/character-display'
import type { CharacterListCardData } from './character-list-card.lib'

export type CharacterListCardProps = {
  card: CharacterListCardData
  detailHref: string
  campaignLabel?: string
}

/** Roster card for a character summary row — name, summary line, and detail link. */
export function CharacterListCard({
  card,
  detailHref,
  campaignLabel = CHARACTER_CARD_CAMPAIGN_LABEL,
}: CharacterListCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{card.name}</CardTitle>
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
