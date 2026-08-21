import { SquarePen } from 'lucide-react'
import { Button } from '@rpg/ui'

import { PageHeader } from '@/components/layout/page/page-header'

import { MESSAGES_ACTION_COPY, MESSAGES_A11Y_COPY } from '../../lib/messages-copy'

type MessagesWorkspaceHeaderProps = {
  isNewRoute: boolean
  onNewMessage: () => void
  onCancel: () => void
}

export function MessagesWorkspaceHeader({
  isNewRoute,
  onNewMessage,
  onCancel,
}: MessagesWorkspaceHeaderProps) {
  return (
    <PageHeader
      heading={MESSAGES_A11Y_COPY.messages}
      actions={
        isNewRoute ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            {MESSAGES_ACTION_COPY.cancel}
          </Button>
        ) : (
          <Button type="button" onClick={onNewMessage}>
            <SquarePen aria-hidden className="size-4" />
            {MESSAGES_ACTION_COPY.newMessage}
          </Button>
        )
      }
    />
  )
}
