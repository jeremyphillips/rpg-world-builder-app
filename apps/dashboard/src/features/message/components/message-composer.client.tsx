'use client'

import * as React from 'react'
import { Send } from 'lucide-react'
import {
  Button,
  TextareaField,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@rpg/ui'

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

  const isDisabled = !draft.trim() || isSubmitting

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="min-w-0 flex-1">
        <TextareaField
          ref={textareaRef}
          id="message-draft"
          label=""
          aria-label={MESSAGES_FORM_COPY.messageLabel}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className={messagesWorkspaceComposerTextareaClasses}
        />
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              size="icon"
              aria-label={MESSAGES_ACTION_COPY.send}
              disabled={isDisabled}
            >
              <Send />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{MESSAGES_ACTION_COPY.sendMessageTooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </form>
  )
}
