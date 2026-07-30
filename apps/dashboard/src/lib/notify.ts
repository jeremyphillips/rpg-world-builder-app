import type { ContentTypeKey } from '@rpg/contracts'
import { toast } from '@rpg/ui'

import { formatContentDeletedMessage } from '@/features/content/lib/content-type-labels'

export function notifyContentDeleted(contentTypeKey: ContentTypeKey): void {
  toast.success(formatContentDeletedMessage(contentTypeKey))
}
