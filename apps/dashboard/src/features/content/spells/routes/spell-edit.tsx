import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentEditShell } from '../../lib/content-edit-shell'
import { useSpells } from '../hooks/use-spells'

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
      loadErrorLabel="Could not load spells."
      notFoundLabel="Spell not found."
      backHref={ROUTES.content.spells.detail(campaignId, spellId)}
    />
  )
}
