export const MESSAGES_SCOPE_COPY = {
  chipRemoveLabel: 'Clear campaign filter',
  showAllLabel: 'Show all',
  invalidHeading: 'This campaign filter is no longer available.',
  invalidBody: 'Showing all messages instead.',
  invalidDismissLabel: 'Dismiss',
  outOfScopeEyebrow: 'Current conversation',
} as const

export const MESSAGES_EMPTY_COPY = {
  globalListHeading: 'No conversations yet',
  globalListBody: 'Start a direct message with someone from your campaigns.',
  scopedListHeading: 'No conversations for this campaign yet.',
  scopedListBody: 'Start a conversation with a campaign member.',
  scopedRecipientHeading: 'No available campaign members.',
  scopedRecipientBody: 'Everyone eligible is already listed or unavailable to message.',
  globalRecipientHeading: 'No eligible recipients',
  globalRecipientBody: 'You can message people who share a current campaign membership with you.',
  selectConversationHeading: 'Select a conversation',
  selectConversationBody: 'Choose a conversation from the list or start a new message.',
  chooseRecipientHeading: 'Choose a recipient',
  chooseRecipientBody: 'Select someone from the list to start a direct message.',
} as const

export const MESSAGES_ACTION_COPY = {
  newMessage: 'New message',
  backToMessages: 'Back to messages',
  startConversation: 'Start conversation',
  cancel: 'Cancel',
  send: 'Send',
  loadOlderMessages: 'Load older messages',
  viewForCampaign: 'View messages for this campaign',
  viewAll: 'View all messages',
} as const

export const MESSAGES_FORM_COPY = {
  recipientLabel: 'Recipient',
  recipientPlaceholder: 'Search campaign members',
  messageLabel: 'Message',
} as const

export const MESSAGES_STATUS_COPY = {
  loadingConversations: 'Loading conversations…',
  loadingMessages: 'Loading messages…',
  loadingRecipients: 'Loading recipients…',
  loadingOlderMessages: 'Loading older messages…',
  noMessagesYet: 'No messages yet',
} as const

export const MESSAGES_ERROR_COPY = {
  loadConversations: 'Could not load conversations.',
  loadMessages: 'Could not load messages.',
  loadRecipients: 'Could not load recipients.',
  loadMessageRecipients: 'Could not load message recipients.',
  loadOlderMessages: 'Could not load older messages.',
  startConversation: 'Could not start conversation.',
  sendMessage: 'Could not send message.',
  markConversationRead: 'Could not mark conversation as read.',
} as const

export const MESSAGES_A11Y_COPY = {
  conversations: 'Conversations',
  conversation: 'Conversation',
  messages: 'Messages',
  yourMessage: 'Your message',
} as const

export function formatMessagesScopeChipLabel(campaignName: string): string {
  return `Campaign: ${campaignName}`
}

export function formatMessagesScopeSummary(scopedCount: number, hiddenCount: number): string {
  const shownLabel = scopedCount === 1 ? 'conversation shown' : 'conversations shown'
  const hiddenLabel =
    hiddenCount === 1
      ? 'conversation outside this campaign hidden'
      : 'conversations outside this campaign hidden'

  return `${scopedCount} ${shownLabel} · ${hiddenCount} ${hiddenLabel}`
}

export function formatMessagesOutOfScopeSupporting(campaignName: string): string {
  return `Not included in the ${campaignName} filter.`
}

export function formatMessagesSharedCampaignCount(count: number): string {
  return count === 1 ? '1 shared campaign' : `${count} shared campaigns`
}

export function formatMessagesUnreadBadge(count: number): string {
  return count > 99 ? '99+' : String(count)
}

export function formatMessageBubbleAriaLabel(
  isOwn: boolean,
  peerDisplayName: string | undefined,
): string {
  if (isOwn) return MESSAGES_A11Y_COPY.yourMessage
  return `Message from ${peerDisplayName ?? 'peer'}`
}
