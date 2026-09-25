import type { MediaScope } from '@rpg/contracts'

export type PcMediaScopeKind = 'user-pc' | 'campaign-pc'

export type ResolveCharacterMediaScopeInput = {
  characterType: 'pc' | 'npc'
  userId?: string
  campaignId?: string
  pcScopeKind?: PcMediaScopeKind
}

/** Resolves upload scope for character media — edit authorization stays at the route. */
export function resolveCharacterMediaScope(
  input: ResolveCharacterMediaScopeInput,
): MediaScope | undefined {
  if (input.characterType === 'npc') {
    return input.campaignId ? { kind: 'campaign-npc', campaignId: input.campaignId } : undefined
  }

  if (input.pcScopeKind === 'campaign-pc' && input.campaignId) {
    return { kind: 'campaign-pc', campaignId: input.campaignId }
  }

  return input.userId ? { kind: 'user-pc', userId: input.userId } : undefined
}
