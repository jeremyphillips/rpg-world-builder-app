import { Link } from 'react-router-dom'
import { buttonVariants, Heading, Text } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page/page-header'
import { WidePage } from '@/components/layout/page/wide-page'
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
    <WidePage spacing="relaxed">
      <PageHeader heading={heading} />
      <Heading variant="section" as="h2">
        Not found
      </Heading>
      <Text variant="muted">{message}</Text>
      <Link
        to={ROUTES.gameTerms.hub(campaignId)}
        className={buttonVariants({ variant: 'outline' })}
      >
        Back to Game Terms
      </Link>
    </WidePage>
  )
}

export { GAME_TERMS_HUB_LABEL }
