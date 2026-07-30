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

/** Roster card for a character summary row — name, summary line, and detail link. */
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
        {controllerLine ? (
          <Text variant="small" className="text-muted-foreground">
            {controllerLine}
          </Text>
        ) : null}
        {showCampaign && card.campaign ? (
          <CampaignDisplayName
            display={buildCampaignDisplay(card.campaign)}
            surface="inlineMuted"
          />
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
