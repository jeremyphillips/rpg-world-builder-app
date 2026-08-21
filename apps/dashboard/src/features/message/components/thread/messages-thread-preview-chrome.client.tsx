'use client'

import { MessagesMetadata } from '../messages-metadata.client'
import { messageThreadPreviewEyebrowClasses } from './message-thread.variants'
import { MESSAGES_PREVIEW_COPY } from '../../lib/messages-copy'

export function MessagesThreadPreviewChrome() {
  return (
    <>
      <MessagesMetadata className={messageThreadPreviewEyebrowClasses}>
        {MESSAGES_PREVIEW_COPY.selectRecipientBody}
      </MessagesMetadata>
      <MessagesMetadata className={messageThreadPreviewEyebrowClasses}>
        {MESSAGES_PREVIEW_COPY.previousConversationEyebrow}
      </MessagesMetadata>
    </>
  )
}
