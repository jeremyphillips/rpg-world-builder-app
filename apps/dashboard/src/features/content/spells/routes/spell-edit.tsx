import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import {
  formatContentNotFoundMessage,
  formatContentListLoadErrorMessage,
} from '@/features/content/lib/content-type-labels'
import { ContentEditShell } from '../../lib/forms/shells/content-edit-shell'
import { useSpells } from '../hooks/use-spells'
// Registers the spell form def into the content form registry on module load.
import '../lib/spell-form-def'

export function SpellEdit() {
  const { campaignId = '', spellId = '' } = useParams<{
    campaignId: string
    spellId: string
  }>()
  const { isPending, isError } = useSpells(campaignId)

  return (
    <ContentEditShell
      contentType="spells"
      campaignId={campaignId}
      entityId={spellId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel={formatContentListLoadErrorMessage('spells')}
      notFoundLabel={formatContentNotFoundMessage('spells')}
      backHref={ROUTES.content.spells.detail(campaignId, spellId)}
    />
  )
}
