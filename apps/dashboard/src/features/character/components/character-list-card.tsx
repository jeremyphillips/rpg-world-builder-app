import { Link } from 'react-router-dom'
import type { CharacterRosterStatus } from '@rpg/contracts'
import {
  Badge,
  ButtonLink,
  cn,
  Card,
  CardFooter,
  CardHeader,
  IdentityRowHeadingLine,
  IdentityRowSupporting,
  identityRowStackVariants,
  type GenericCardDensity,
} from '@rpg/ui'

import { BuilderOptionCardImage } from './builder/steps/shared/builder-option-card-image'
import { CampaignDisplayName, buildCampaignDisplay } from '@/features/campaign'

import { resolveHeadingAccessoryBadgeSize } from '../lib/heading-accessory-size.lib'
import { resolveCharacterRosterStatusPresentation } from '../lib/campaign-roster-presentation'
import type { CharacterListCardData } from './character-list-card.lib'

export type CharacterListCardProps = {
  card: CharacterListCardData
  detailHref: string
  showCampaign?: boolean
  controllerLine?: string
  rosterStatus?: CharacterRosterStatus
  density?: GenericCardDensity
}

type CharacterListCardHeaderProps = {
  card: CharacterListCardData
  showCampaign: boolean
  controllerLine?: string
  rosterPresentation: ReturnType<typeof resolveCharacterRosterStatusPresentation> | null
  density: GenericCardDensity
}

function CharacterListCardHeader({
  card,
  showCampaign,
  controllerLine,
  rosterPresentation,
  density,
}: CharacterListCardHeaderProps) {
  const headingAccessoryBadgeSize = resolveHeadingAccessoryBadgeSize(density)
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
              <Badge
                appearance={rosterPresentation.appearance}
                tone={rosterPresentation.tone}
                size={headingAccessoryBadgeSize}
              >
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
  density = 'spacious',
}: CharacterListCardProps) {
  const rosterPresentation = rosterStatus
    ? resolveCharacterRosterStatusPresentation(rosterStatus)
    : null

  return (
    <Card
      density={density}
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
        density={density}
      />
      <CardFooter>
        <ButtonLink link={<Link to={detailHref} />} variant="outline" size="sm">
          View
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}
