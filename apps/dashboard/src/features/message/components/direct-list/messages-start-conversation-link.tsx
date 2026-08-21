import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { MESSAGES_ACTION_COPY } from '../../lib/messages-copy'

/** Mobile-only fallback when the workspace header action may be off-screen. */
export function MessagesStartConversationLink({ campaignId }: { campaignId?: string }) {
  return (
    <Link
      to={ROUTES.messages.new({ campaignId })}
      className={`${buttonVariants({ variant: 'link', size: 'sm' })} md:hidden`}
    >
      {MESSAGES_ACTION_COPY.startConversation}
    </Link>
  )
}
