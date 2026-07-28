import type {
  CampaignBuildContext,
  CharacterBuildAcquisition,
  CharacterOwnershipTarget,
  SystemRulesetId,
} from '@rpg/contracts'

export type CampaignBuildContextUnavailable =
  | { kind: 'loading' }
  | { kind: 'missing_campaign_id' }
  | { kind: 'missing_ruleset' }
  | { kind: 'missing_session_user' }
  | {
      kind: 'invalid_acquisition_combo'
      characterKind: CampaignBuildContext['characterKind']
      acquisitionKind: CharacterBuildAcquisition['kind']
    }

type CampaignBuildContextUnavailableInput = {
  campaignId: string | undefined
  rulesetId: SystemRulesetId | undefined
  isPending: boolean
  hasPatch: boolean
  hasCatalog: boolean
  characterKind: CampaignBuildContext['characterKind']
  ownershipTarget: CharacterOwnershipTarget | { type: 'user'; userId: string }
  acquisition: CharacterBuildAcquisition
  context: CampaignBuildContext | null
}

function isAwaitingCampaignBuildDependencies(
  args: Pick<
    CampaignBuildContextUnavailableInput,
    'campaignId' | 'rulesetId' | 'isPending' | 'hasPatch' | 'hasCatalog'
  >,
): boolean {
  return (
    args.isPending ||
    Boolean(args.campaignId && args.rulesetId && (!args.hasPatch || !args.hasCatalog))
  )
}

function isMissingPcOnboardingUser(
  characterKind: CampaignBuildContext['characterKind'],
  acquisition: CharacterBuildAcquisition,
  ownershipTarget: CharacterOwnershipTarget | { type: 'user'; userId: string },
): boolean {
  return (
    characterKind === 'pc' &&
    acquisition.kind === 'campaign_pc_onboarding' &&
    ownershipTarget.type === 'user' &&
    !('userId' in ownershipTarget)
  )
}

export function resolveCampaignBuildContextUnavailable(
  args: CampaignBuildContextUnavailableInput,
): CampaignBuildContextUnavailable | null {
  if (args.context) return null
  if (isAwaitingCampaignBuildDependencies(args)) return { kind: 'loading' }
  if (!args.campaignId) return { kind: 'missing_campaign_id' }
  if (!args.rulesetId) return { kind: 'missing_ruleset' }
  if (isMissingPcOnboardingUser(args.characterKind, args.acquisition, args.ownershipTarget)) {
    return { kind: 'missing_session_user' }
  }

  return {
    kind: 'invalid_acquisition_combo',
    characterKind: args.characterKind,
    acquisitionKind: args.acquisition.kind,
  }
}
