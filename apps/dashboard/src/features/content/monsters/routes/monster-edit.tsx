import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import {
  formatContentListLoadErrorMessage,
  formatContentNotFoundMessage,
} from '@/features/content/lib/content-type-labels'
import { ContentEditShell } from '../../lib/forms/shells/edit/content-edit-shell'
import { useMonsters } from '../hooks/use-monsters'
import '../lib/monster-form-def'

export function MonsterEdit() {
  const { campaignId = '', monsterId = '' } = useParams<{
    campaignId: string
    monsterId: string
  }>()
  const { isPending, isError } = useMonsters(campaignId)

  return (
    <ContentEditShell
      contentType="monsters"
      campaignId={campaignId}
      entityId={monsterId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel={formatContentListLoadErrorMessage('monsters')}
      notFoundLabel={formatContentNotFoundMessage('monsters')}
      backHref={ROUTES.content.monsters.detail(campaignId, monsterId)}
      overviewHref={ROUTES.content.monsters.overview(campaignId)}
      contentTypeKey="monsters"
    />
  )
}
