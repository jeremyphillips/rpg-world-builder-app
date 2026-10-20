import { Link } from 'react-router-dom'
import { ButtonLink, Heading, Text } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page/page-header'
import { PageShell } from '@/components/layout/page/page-shell'
import { ROUTES } from '@/app/routes'

const GAME_TERMS_HUB_LABEL = 'Game Terms'

export type GameTermsFallbackProps = {
  heading?: string
  message: string
  campaignId: string
}

/** Full-page fallback for unknown or non-browse Game Terms routes. */
export function GameTermsFallback({
  heading = GAME_TERMS_HUB_LABEL,
  message,
  campaignId,
}: GameTermsFallbackProps) {
  return (
    <PageShell width="full" rhythm="relaxed">
      <PageHeader heading={heading} />
      <Heading variant="section" as="h2">
        Not found
      </Heading>
      <Text variant="muted">{message}</Text>
      <ButtonLink link={<Link to={ROUTES.gameTerms.hub(campaignId)} />} variant="outline">
        Back to Game Terms
      </ButtonLink>
    </PageShell>
  )
}

export { GAME_TERMS_HUB_LABEL }
