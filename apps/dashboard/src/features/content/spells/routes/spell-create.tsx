import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { ContentCreateShell } from '../../lib/forms/shells/content-create-shell'
// Registers the spell form def into the content form registry on module load.
import '../lib/spell-form-def'

export function SpellCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="spells"
      campaignId={campaignId}
      heading={formatContentCreateHeading('spells')}
      backHref={ROUTES.content.spells.overview(campaignId)}
    />
  )
}
