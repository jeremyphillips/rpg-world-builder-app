import { useParams, Navigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

/** Redirect legacy Homebrew vocabulary hub to Game Terms. */
export function VocabularyLanding() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return <Navigate to={ROUTES.gameTerms.hub(campaignId)} replace />
}

/** Stable export for Storybook/tests — redirects immediately. */
export function VocabularyLandingContent({ campaignId }: { campaignId: string }) {
  return <Navigate to={ROUTES.gameTerms.hub(campaignId)} replace />
}
