import type { Notification } from '@rpg/contracts'
import type { ReactNode } from 'react'
import { Icon, contentIdentityIcon } from '@rpg/ui'

export function resolveNotificationPreviewIcon(type: Notification['type']): ReactNode {
  switch (type) {
    case 'message.direct.received':
      return <Icon name="mail" size="lg" />
    case 'campaign.invite.received':
      return <Icon name="users" size="lg" />
    case 'campaign.invite.accepted':
    case 'campaign.invite.completed':
      return <Icon name={contentIdentityIcon('campaign')} size="lg" />
    default:
      return <Icon name="mail" size="lg" />
  }
}
