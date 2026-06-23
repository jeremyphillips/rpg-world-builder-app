import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentEditShell } from '../../lib/content-edit-shell'
import { useFeats } from '../hooks/use-feats'
// Registers the feat form def into the content form registry on module load.
import '../lib/feat-form-def'

export function FeatEdit() {
  const { campaignId = '', featId = '' } = useParams<{
    campaignId: string
    featId: string
  }>()
  const { isPending, isError } = useFeats(campaignId)

  return (
    <ContentEditShell
      contentType="feats"
      campaignId={campaignId}
      entityId={featId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel="Could not load feats."
      notFoundLabel="Feat not found."
      backHref={ROUTES.content.feats.detail(campaignId, featId)}
    />
  )
}
