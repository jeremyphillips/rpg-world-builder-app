export function isIncomingUnreadLatestMessage(input: {
  latestMessageSenderUserId: string | undefined
  currentUserId: string | undefined
}): boolean {
  return Boolean(
    input.latestMessageSenderUserId && input.latestMessageSenderUserId !== input.currentUserId,
  )
}

export function resolveMessageThreadMarkReadTrigger(input: {
  hasCompletedInitialOpen: boolean
  processedLatestMessageId: string | null
  latestMessageId: string
}): 'initial-open' | 'new-inbound' | null {
  if (!input.hasCompletedInitialOpen) return 'initial-open'

  if (input.processedLatestMessageId !== input.latestMessageId) {
    return 'new-inbound'
  }

  return null
}

export function isMessageThreadMarkReadDocumentEligible(input: {
  trigger: 'initial-open' | 'new-inbound'
  isDocumentVisible: boolean
  isDocumentFocused: boolean
}): boolean {
  if (input.trigger === 'initial-open') return input.isDocumentVisible
  return input.isDocumentVisible && input.isDocumentFocused
}
