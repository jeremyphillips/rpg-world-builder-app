'use client'

import * as React from 'react'
import { Button, TextareaField } from '@rpg/ui'

import { MESSAGES_ACTION_COPY, MESSAGES_FORM_COPY } from '../lib/messages-copy'
import { messagesWorkspaceComposerTextareaClasses } from './messages-workspace.variants'

type MessageComposerProps = {
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
}

function resizeComposerTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

export function MessageComposer({
  draft,
  onDraftChange,
  onSubmit,
  isSubmitting,
}: MessageComposerProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    resizeComposerTextarea(textarea)
  }, [draft])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    onSubmit()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    if (event.nativeEvent.isComposing) return

    event.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <TextareaField
        ref={textareaRef}
        id="message-draft"
        label={MESSAGES_FORM_COPY.messageLabel}
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        className={messagesWorkspaceComposerTextareaClasses}
      />
      <Button type="submit" disabled={!draft.trim() || isSubmitting}>
        {MESSAGES_ACTION_COPY.send}
      </Button>
    </form>
  )
}
