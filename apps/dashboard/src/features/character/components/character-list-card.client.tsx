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

import { ROUTES } from '@/app/routes'

import { CHARACTER_CARD_CAMPAIGN_LABEL } from '../lib/display/character-display'
import type { CharacterCardViewModel } from '../lib/display/character-display'

export type CharacterListCardProps = {
  card: CharacterCardViewModel
  detailHref?: string
}

/** Roster card for a standalone PC — name, summary line, and detail link. */
export function CharacterListCard({ card, detailHref }: CharacterListCardProps) {
  const href = detailHref ?? ROUTES.characters.detail(card.id)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{card.name}</CardTitle>
        <CardDescription>{card.summary}</CardDescription>
        {card.campaign ? (
          <Text variant="small" className="text-muted-foreground">
            {CHARACTER_CARD_CAMPAIGN_LABEL}: {card.campaign.name}
          </Text>
        ) : null}
      </CardHeader>
      <CardFooter className="mt-auto">
        <Link to={href} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          View
        </Link>
      </CardFooter>
    </Card>
  )
}
