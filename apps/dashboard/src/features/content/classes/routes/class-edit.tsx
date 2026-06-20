import { useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { ContentEditShell } from '../../lib/content-edit-shell'
import { useClasses } from '../hooks/use-classes'

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
