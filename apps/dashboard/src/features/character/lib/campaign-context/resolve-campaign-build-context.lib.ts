import {
  DEFAULT_ABILITY_GENERATION_RULES,
  type CampaignBuildContext,
  type CampaignNpcBuildContext,
  type CampaignPcBuildContext,
  type CharacterBuildCatalog,
  type CharacterOwnershipTarget,
  type ContentPlayActor,
  type RulesetPatchRead,
  type SystemRulesetId,
} from '@rpg/contracts'
import type { CharacterBuildAcquisition } from '@rpg/contracts/rpg/character-builder'

type CampaignBuildContextSource = {
  campaignId: string
  rulesetId: SystemRulesetId
  catalog: CharacterBuildCatalog
  patch: RulesetPatchRead
  characterKind: CampaignBuildContext['characterKind']
  ownershipTarget: CharacterOwnershipTarget | { type: 'user'; userId: string }
  acquisition: CharacterBuildAcquisition
  playActor?: ContentPlayActor
}

/** Assembles a campaign build context from loaded patch + catalog data. */
export function resolveCampaignBuildContext(
  input: CampaignBuildContextSource,
): CampaignBuildContext | null {
  const {
    campaignId,
    rulesetId,
    catalog,
    patch,
    characterKind,
    ownershipTarget,
    acquisition,
    playActor,
  } = input

  const rulesScope = { type: 'campaign' as const, campaignId, rulesetId }
  const shared = {
    channel: 'build' as const,
    surface: 'dashboard' as const,
    mode: 'dashboard' as const,
    scope: { type: 'campaign' as const, campaignId, rulesetId },
    rulesScope,
    rulesetId,
    catalog,
    characterCreationRules: {
      ...patch.characterCreation,
      abilityGeneration: {
        ...DEFAULT_ABILITY_GENERATION_RULES,
        standardArray: [...patch.characterCreation.standardArray],
      },
      armorClass: patch.mechanics.armorClass,
    },
    permissions: { canCreateCharacter: true },
  }

  if (characterKind === 'npc' && acquisition.kind === 'campaign_npc') {
    const npcContext: CampaignNpcBuildContext = {
      ...shared,
      characterKind: 'npc',
      ownershipTarget: { type: 'campaign', campaignId },
      acquisition,
      playActor: playActor?.kind === 'npc' ? playActor : { kind: 'npc' },
    }
    return npcContext
  }

  if (
    characterKind === 'pc' &&
    acquisition.kind === 'campaign_pc_onboarding' &&
    ownershipTarget.type === 'user' &&
    'userId' in ownershipTarget
  ) {
    const pcContext: CampaignPcBuildContext = {
      ...shared,
      characterKind: 'pc',
      ownershipTarget,
      acquisition,
      ...(playActor?.kind === 'pc' ? { playActor } : {}),
    }
    return pcContext
  }

  return null
}
