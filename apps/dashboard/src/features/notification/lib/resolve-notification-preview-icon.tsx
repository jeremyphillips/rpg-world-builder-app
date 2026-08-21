import type { Notification } from '@rpg/contracts'
import { Castle, Mail, Users } from 'lucide-react'
import type { ReactNode } from 'react'

const NOTIFICATION_PREVIEW_ICON_CLASS = 'size-4'

export function resolveNotificationPreviewIcon(type: Notification['type']): ReactNode {
  switch (type) {
    case 'message.direct.received':
      return <Mail aria-hidden className={NOTIFICATION_PREVIEW_ICON_CLASS} />
    case 'campaign.invite.received':
      return <Users aria-hidden className={NOTIFICATION_PREVIEW_ICON_CLASS} />
    case 'campaign.invite.accepted':
    case 'campaign.invite.completed':
      return <Castle aria-hidden className={NOTIFICATION_PREVIEW_ICON_CLASS} />
    default:
      return <Mail aria-hidden className={NOTIFICATION_PREVIEW_ICON_CLASS} />
  }
}
