import {
  finalizeNpcCharacterBuild,
  finalizePcCharacterBuild,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
} from '@rpg/contracts'
import type { CharacterBuildAcquisition } from '@rpg/contracts/rpg/character-builder'

import { ROUTES } from '@/app/routes'

export type FinalizeBuilderCharacterArgs = {
  acquisition: CharacterBuildAcquisition
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  resolvedChoiceSets: ChoiceSet[]
  createNpc: (input: {
    campaignId: string
    input: ReturnType<typeof finalizeNpcCharacterBuild>
  }) => Promise<{ character: { id: string } }>
  createStandalonePc: (
    input: ReturnType<typeof finalizePcCharacterBuild>,
  ) => Promise<{ id: string }>
  completeCampaignOnboarding: (
    input: ReturnType<typeof finalizePcCharacterBuild>,
  ) => Promise<{ campaignId: string; characterId: string }>
}

export async function finalizeBuilderCharacter({
  acquisition,
  context,
  draft,
  resolvedChoiceSets,
  createNpc,
  createStandalonePc,
  completeCampaignOnboarding,
}: FinalizeBuilderCharacterArgs): Promise<string> {
  switch (acquisition.kind) {
    case 'campaign_npc': {
      const input = finalizeNpcCharacterBuild(draft, context, { resolvedChoiceSets })
      const npc = await createNpc({ campaignId: acquisition.campaignId, input })
      return ROUTES.campaign.npcs.detail(acquisition.campaignId, npc.character.id)
    }
    case 'campaign_pc_onboarding': {
      const input = finalizePcCharacterBuild(draft, context, { resolvedChoiceSets })
      const result = await completeCampaignOnboarding(input)
      return ROUTES.campaign.characters.detail(result.campaignId, result.characterId)
    }
    case 'standalone': {
      const input = finalizePcCharacterBuild(draft, context, { resolvedChoiceSets })
      const character = await createStandalonePc(input)
      return ROUTES.characters.detail(character.id)
    }
  }
}
