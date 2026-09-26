import type { Notification } from '@rpg/contracts'
import { Mail, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { contentIdentityIcon } from '@rpg/ui'

const NOTIFICATION_PREVIEW_ICON_CLASS = 'size-4'

const CampaignIdentityIcon = contentIdentityIcon('campaign')

export function resolveNotificationPreviewIcon(type: Notification['type']): ReactNode {
  switch (type) {
    case 'message.direct.received':
      return <Mail aria-hidden className={NOTIFICATION_PREVIEW_ICON_CLASS} />
    case 'campaign.invite.received':
      return <Users aria-hidden className={NOTIFICATION_PREVIEW_ICON_CLASS} />
    case 'campaign.invite.accepted':
    case 'campaign.invite.completed':
      return <CampaignIdentityIcon aria-hidden className={NOTIFICATION_PREVIEW_ICON_CLASS} />
    default:
      return <Mail aria-hidden className={NOTIFICATION_PREVIEW_ICON_CLASS} />
  }
}
