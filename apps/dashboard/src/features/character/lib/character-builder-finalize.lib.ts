import {
  finalizeCharacterBuild,
  finalizeNpcCharacterBuild,
  type CharacterBuildAcquisition,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
} from '@rpg/contracts'

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
  createStandalonePc: (input: ReturnType<typeof finalizeCharacterBuild>) => Promise<{ id: string }>
  completeInviteWithNewCharacter: (
    input: ReturnType<typeof finalizeCharacterBuild>,
  ) => Promise<{ campaignId: string; characterId: string }>
}

export async function finalizeBuilderCharacter({
  acquisition,
  context,
  draft,
  resolvedChoiceSets,
  createNpc,
  createStandalonePc,
  completeInviteWithNewCharacter,
}: FinalizeBuilderCharacterArgs): Promise<string> {
  switch (acquisition.kind) {
    case 'campaign_npc': {
      const input = finalizeNpcCharacterBuild(draft, context, { resolvedChoiceSets })
      const npc = await createNpc({ campaignId: acquisition.campaignId, input })
      return ROUTES.campaign.npcs.detail(acquisition.campaignId, npc.character.id)
    }
    case 'campaign_invite': {
      const input = finalizeCharacterBuild(draft, context, { resolvedChoiceSets })
      const result = await completeInviteWithNewCharacter(input)
      return ROUTES.campaign.characters.detail(result.campaignId, result.characterId)
    }
    case 'standalone': {
      const input = finalizeCharacterBuild(draft, context, { resolvedChoiceSets })
      const character = await createStandalonePc(input)
      return ROUTES.characters.detail(character.id)
    }
  }
}
