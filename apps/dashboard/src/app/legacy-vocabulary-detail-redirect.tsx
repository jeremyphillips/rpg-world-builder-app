import { useParams, Navigate } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

/** Redirect legacy Homebrew vocabulary set route to Game Terms overview. */
export function VocabularyDetail() {
  const { campaignId = '', setId = '' } = useParams<{ campaignId: string; setId: string }>()
  return <Navigate to={ROUTES.gameTerms.overview(campaignId, setId)} replace />
}
