export type MessagesThreadMode = 'active' | 'preview'

export function resolveMessagesThreadModeBehavior(mode: MessagesThreadMode) {
  return {
    showComposer: mode === 'active',
    isAttentionEligible: mode === 'active',
    showPreviewChrome: mode === 'preview',
  }
}
