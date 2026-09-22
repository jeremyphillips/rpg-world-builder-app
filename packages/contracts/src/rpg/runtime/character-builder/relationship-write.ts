import type { CharacterBuildContext } from './context'
import { isCampaignBuildContext } from './context'

/** Campaign managers authoring NPCs may write character relationship edges. */
export function canWriteCharacterRelationships(context: CharacterBuildContext): boolean {
  return isCampaignBuildContext(context) && context.acquisition.kind === 'campaign_npc'
}

/** Connections step is available only for authorized campaign relationship authoring. */
export function isCharacterConnectionsStepApplicable(context: CharacterBuildContext): boolean {
  return canWriteCharacterRelationships(context)
}
