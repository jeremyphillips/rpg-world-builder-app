'use client'

import { MessagesMetadata } from './messages-metadata.client'
import { messagesWorkspacePreviewEyebrowClasses } from './messages-workspace.variants'
import { MESSAGES_PREVIEW_COPY } from '../lib/messages-copy'

export function MessagesThreadPreviewChrome() {
  return (
    <>
      <MessagesMetadata className={messagesWorkspacePreviewEyebrowClasses}>
        {MESSAGES_PREVIEW_COPY.selectRecipientBody}
      </MessagesMetadata>
      <MessagesMetadata className={messagesWorkspacePreviewEyebrowClasses}>
        {MESSAGES_PREVIEW_COPY.previousConversationEyebrow}
      </MessagesMetadata>
    </>
  )
}
