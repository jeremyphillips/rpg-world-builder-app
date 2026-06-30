import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentCreateShell } from '../../lib/forms/shells/content-create-shell'
// Registers the class form def into the content form registry on module load.
import '../lib/class-form-def'

export function ClassCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  return (
    <ContentCreateShell
      contentType="classes"
      campaignId={campaignId}
      heading="New Class"
      backHref={ROUTES.content.classes.overview(campaignId)}
    />
  )
}
