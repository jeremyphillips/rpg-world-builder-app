export const PLAYER_VISIBLE_ONLY_TO_YOU_LABEL = 'Visible only to you'
export const PLAYER_VISIBLE_ONLY_TO_YOU_TOOLTIP =
  'Only you can discover and select this content in the campaign.'

export const PLAYER_LIMITED_VISIBILITY_TOOLTIP =
  'This content is limited to you and selected players in the campaign.'

export function formatPlayerLimitedVisibilityLabel(otherParticipantCount: number): string {
  const noun = otherParticipantCount === 1 ? 'other' : 'others'
  return `Limited visibility · You and ${otherParticipantCount} ${noun}`
}
