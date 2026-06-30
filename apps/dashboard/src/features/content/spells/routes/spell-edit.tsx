import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentEditShell } from '../../lib/forms/content-edit-shell'
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
      loadErrorLabel="Could not load spells."
      notFoundLabel="Spell not found."
      backHref={ROUTES.content.spells.detail(campaignId, spellId)}
    />
  )
}
