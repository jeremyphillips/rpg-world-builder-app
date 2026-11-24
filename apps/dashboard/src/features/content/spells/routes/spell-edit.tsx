import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { ContentEditShell } from '../../lib/forms/shells/edit/content-edit-shell'
import { useSpells } from '../hooks/use-spells'
import { spellFormDef } from '../lib/spell-form-def'

export function SpellEdit() {
  const { campaignId = '', spellId = '' } = useParams<{
    campaignId: string
    spellId: string
  }>()
  const { isPending, isError } = useSpells(campaignId)

  return (
    <ContentEditShell
      def={spellFormDef}
      campaignId={campaignId}
      entityId={spellId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel={formatContentListLoadErrorMessage('spells')}
      notFoundLabel={formatContentNotFoundMessage('spells')}
      backHref={ROUTES.content.spells.detail(campaignId, spellId)}
      overviewHref={ROUTES.content.spells.overview(campaignId)}
    />
  )
}
