import { Link } from 'react-router-dom'
import type { CharacterRosterStatus } from '@rpg/contracts'
import {
  Badge,
  buttonVariants,
  cn,
  Card,
  CardFooter,
  CardHeader,
  IdentityRowHeadingLine,
  IdentityRowSupporting,
  identityRowStackVariants,
} from '@rpg/ui'

import { BuilderOptionCardImage } from './builder/steps/shared/builder-option-card-image'
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

type CharacterListCardHeaderProps = {
  card: CharacterListCardData
  showCampaign: boolean
  controllerLine?: string
  rosterPresentation: ReturnType<typeof resolveCharacterRosterStatusPresentation> | null
}

function CharacterListCardHeader({
  card,
  showCampaign,
  controllerLine,
  rosterPresentation,
}: CharacterListCardHeaderProps) {
  const campaignLine =
    showCampaign && card.campaign ? (
      <CampaignDisplayName
        display={buildCampaignDisplay({
          id: card.campaign.id,
          name: card.campaign.name,
          emblemUrl: card.campaign.emblemUrl,
        })}
        surface="inlineMuted"
      />
    ) : null

  return (
    <CardHeader>
      <div className={cn(identityRowStackVariants(), 'min-w-0')}>
        <IdentityRowHeadingLine
          heading={<h3>{card.name}</h3>}
          headingEnd={
            rosterPresentation ? (
              <Badge appearance={rosterPresentation.appearance} tone={rosterPresentation.tone}>
                {rosterPresentation.label}
              </Badge>
            ) : undefined
          }
        />
        <IdentityRowSupporting wrap>{card.summary}</IdentityRowSupporting>
        {controllerLine ? (
          <IdentityRowSupporting wrap>{controllerLine}</IdentityRowSupporting>
        ) : null}
        {campaignLine ? <IdentityRowSupporting wrap>{campaignLine}</IdentityRowSupporting> : null}
      </div>
    </CardHeader>
  )
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
    <Card
      stretch
      leadMedia={
        card.displayImagesByRole?.primary ? (
          <BuilderOptionCardImage display={card.displayImagesByRole.primary} alt="" />
        ) : undefined
      }
    >
      <CharacterListCardHeader
        card={card}
        showCampaign={showCampaign}
        controllerLine={controllerLine}
        rosterPresentation={rosterPresentation}
      />
      <CardFooter>
        <Link to={detailHref} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          View
        </Link>
      </CardFooter>
    </Card>
  )
}
