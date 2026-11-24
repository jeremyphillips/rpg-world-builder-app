import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { formatContentCreateHeading } from '@/features/content/lib/content-type-labels'
import { ContentCreateShell } from '../../lib/forms/shells/create/content-create-shell'
import { classFormDef } from '../lib/class-form-def'

export function ClassCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      def={classFormDef}
      campaignId={campaignId}
      heading={formatContentCreateHeading('classes')}
      backHref={ROUTES.content.classes.overview(campaignId)}
    />
  )
}
