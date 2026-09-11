import type { ContentPreviewResourcesProps } from '../../lib/forms/preview/content-form-preview.types'
import { useSubclasses } from '../hooks/use-subclasses'

export type ClassPreviewResources = {
  subclasses: readonly { id: string; name: string }[]
}

export function ClassPreviewResourcesProvider({
  ctx,
  children,
}: ContentPreviewResourcesProps<ClassPreviewResources>) {
  const { data: subclasses = [] } = useSubclasses(ctx.campaignId, ctx.entityId)
  return <>{children({ subclasses })}</>
}
