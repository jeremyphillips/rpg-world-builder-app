import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { ContentCreateShell } from '../../lib/forms/shells/create/content-create-shell'
import { spellFormDef } from '../lib/spell-form-def'

export function SpellCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      def={spellFormDef}
      campaignId={campaignId}
      heading={formatContentCreateHeading('spells')}
      backHref={ROUTES.content.spells.overview(campaignId)}
    />
  )
}
