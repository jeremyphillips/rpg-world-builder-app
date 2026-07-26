import { z } from 'zod'

// ---------------------------------------------------------------------------
// Character build acquisition — drives finalize/orchestration behavior.
// ---------------------------------------------------------------------------

export const characterBuildAcquisitionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('standalone') }),
  z.object({
    kind: z.literal('campaign_npc'),
    campaignId: z.string().min(1),
  }),
  z.object({
    kind: z.literal('campaign_invite'),
    campaignId: z.string().min(1),
    inviteId: z.string().min(1),
  }),
])

export type CharacterBuildAcquisition = z.infer<typeof characterBuildAcquisitionSchema>

export function resolveDefaultCharacterBuildAcquisition(
  context: {
    characterKind: 'pc' | 'npc'
    rulesScope: { type: string; campaignId?: string }
  },
  campaignId?: string,
): CharacterBuildAcquisition {
  if (context.rulesScope.type === 'campaign' && context.characterKind === 'npc' && campaignId) {
    return { kind: 'campaign_npc', campaignId }
  }

  return { kind: 'standalone' }
}
