import type { CharacterBuildAcquisition } from '../../character-builder/acquisition'

export type { CharacterBuildAcquisition } from '../../character-builder/acquisition'
export { characterBuildAcquisitionSchema } from '../../character-builder/acquisition'

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
