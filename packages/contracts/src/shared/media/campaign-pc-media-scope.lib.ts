import type { MediaScope } from './upload-session'

/** Stable scope key — must stay aligned with API media persistence. */
export function serializeMediaScopeKey(scope: MediaScope): string {
  switch (scope.kind) {
    case 'campaign-content':
    case 'campaign-identity':
    case 'campaign-npc':
    case 'campaign-pc':
      return `${scope.kind}:${scope.campaignId}`
    case 'user-pc':
      return `${scope.kind}:${scope.userId}`
  }
}

/** Upload scopes that may attach to the same campaign PC media collection. */
export function resolveCampaignPcMediaScopeKeys(input: {
  campaignId: string
  characterOwnerUserId: string
}): readonly string[] {
  return [
    serializeMediaScopeKey({ kind: 'campaign-pc', campaignId: input.campaignId }),
    serializeMediaScopeKey({ kind: 'user-pc', userId: input.characterOwnerUserId }),
  ]
}

export function isCampaignPcMediaScopeKey(scopeKey: string): boolean {
  return scopeKey.startsWith('campaign-pc:') || scopeKey.startsWith('user-pc:')
}
