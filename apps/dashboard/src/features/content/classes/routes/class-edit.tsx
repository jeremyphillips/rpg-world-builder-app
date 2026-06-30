import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentEditShell } from '../../lib/forms/content-edit-shell'
import { useClasses } from '../hooks/use-classes'
// Registers the class form def into the content form registry on module load.
import '../lib/class-form-def'

export function ClassEdit() {
  const { campaignId = '', classId = '' } = useParams<{
    campaignId: string
    classId: string
  }>()
  const { isPending, isError } = useClasses(campaignId)

  return (
    <ContentEditShell
      contentType="classes"
      campaignId={campaignId}
      entityId={classId}
      isPending={isPending}
      isError={isError}
      loadErrorLabel="Could not load classes."
      notFoundLabel="Class not found."
      backHref={ROUTES.content.classes.detail(campaignId, classId)}
    />
  )
}
