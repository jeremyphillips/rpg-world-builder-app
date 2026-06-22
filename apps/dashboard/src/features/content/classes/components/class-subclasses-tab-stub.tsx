import { Link } from 'react-router-dom'
import { Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

export interface ClassSubclassesTabStubProps {
  campaignId?: string
  entityId?: string
  mode?: 'create' | 'edit'
}

export function ClassSubclassesTabStub({
  campaignId,
  entityId,
  mode = 'create',
}: ClassSubclassesTabStubProps) {
  const isEdit = mode === 'edit' && campaignId && entityId

  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      {isEdit ? (
        <Text variant="muted">
          Subclasses are listed on the{' '}
          <Link
            to={ROUTES.content.classes.detail(campaignId, entityId)}
            className="text-foreground underline underline-offset-4 hover:text-primary"
          >
            class detail page
          </Link>
          . Subclass editing will be available here in a future update.
        </Text>
      ) : (
        <Text variant="muted">Save this class first to add subclasses.</Text>
      )}
    </div>
  )
}
