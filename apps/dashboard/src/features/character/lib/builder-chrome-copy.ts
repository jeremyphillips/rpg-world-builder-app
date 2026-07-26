import type {
  CampaignBuildContext,
  CharacterBuildContext,
  CharacterBuilderStepId,
  CharacterKind,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

export type BuilderChromeCopy = {
  pageHeading: string
  createLabel: string
  creatingLabel: string
  createErrorDefault: string
  exitHref: string
  exitLabel: string
  importHref: string | null
  importLabel: string | null
  reviewValidationHeading: string
  reviewReadyMessage: string
  reviewBlockedMessage: string
  reviewFooterHint: string
  reviewStepDescription: string
  draftRestoreHeadline: string
  draftRestoreDescription: string
  draftRestoreConfirmLabel: string
  draftRestoreCancelLabel: string
}

export function resolveCampaignIdFromContext(
  context: Pick<CharacterBuildContext, 'rulesScope'>,
): string | undefined {
  return context.rulesScope.type === 'campaign' ? context.rulesScope.campaignId : undefined
}

function getCampaignInvitePcChrome(): BuilderChromeCopy {
  return {
    pageHeading: 'Create your campaign character',
    createLabel: 'Create campaign character',
    creatingLabel: 'Creating…',
    createErrorDefault: 'Could not create campaign character.',
    exitHref: '#',
    exitLabel: 'Back to character choice',
    importHref: null,
    importLabel: null,
    reviewValidationHeading: 'Fix the following before creating your campaign character:',
    reviewReadyMessage: 'Your campaign character is ready to create.',
    reviewBlockedMessage: 'Resolve the issues above before creating your campaign character.',
    reviewFooterHint: 'Resolve the issues above before creating your campaign character.',
    reviewStepDescription: 'Review and create your campaign character',
    draftRestoreHeadline: 'Continue your campaign character draft?',
    draftRestoreDescription:
      'A previous campaign character draft was saved in this browser session. Continue where you left off or start over.',
    draftRestoreConfirmLabel: 'Continue previous draft',
    draftRestoreCancelLabel: 'Start over',
  }
}

export function getBuilderChromeCopy(
  characterKind: CharacterKind,
  campaignId?: string,
  acquisitionKind?: 'standalone' | 'campaign_npc' | 'campaign_invite',
): BuilderChromeCopy {
  if (acquisitionKind === 'campaign_invite') {
    return getCampaignInvitePcChrome()
  }

  if (characterKind === 'npc') {
    if (!campaignId) {
      throw new Error('NPC builder chrome requires a campaign id')
    }

    return {
      pageHeading: 'New NPC',
      createLabel: 'Create NPC',
      creatingLabel: 'Creating…',
      createErrorDefault: 'Could not create NPC.',
      exitHref: ROUTES.campaign.npcs.list(campaignId),
      exitLabel: 'Exit',
      importHref: ROUTES.campaign.npcs.import(campaignId),
      importLabel: 'Import NPC',
      reviewValidationHeading: 'Fix the following before adding this NPC:',
      reviewReadyMessage: 'This NPC is ready to add to your campaign.',
      reviewBlockedMessage: 'Resolve the issues above before adding this NPC.',
      reviewFooterHint: 'Resolve the issues above before adding this NPC.',
      reviewStepDescription: 'Review and add this NPC to your campaign',
      draftRestoreHeadline: 'Continue your NPC draft?',
      draftRestoreDescription:
        'A previous NPC draft for this campaign was saved in this browser session. Continue where you left off or start a new NPC.',
      draftRestoreConfirmLabel: 'Continue previous draft',
      draftRestoreCancelLabel: 'Start over',
    }
  }

  return {
    pageHeading: 'New character',
    createLabel: 'Create character',
    creatingLabel: 'Creating…',
    createErrorDefault: 'Could not create character.',
    exitHref: ROUTES.characters.list,
    exitLabel: 'Exit',
    importHref: ROUTES.characters.import,
    importLabel: 'Import character',
    reviewValidationHeading: 'Fix the following before creating:',
    reviewReadyMessage: 'Your character is ready to create.',
    reviewBlockedMessage: 'Resolve the issues above before creating your character.',
    reviewFooterHint: 'Resolve the issues above before creating your character.',
    reviewStepDescription: 'Review and finalize your character',
    draftRestoreHeadline: 'Continue your character?',
    draftRestoreDescription:
      'A previous draft for this ruleset was saved in this browser session. Continue where you left off or start a new character.',
    draftRestoreConfirmLabel: 'Continue previous draft',
    draftRestoreCancelLabel: 'Start over',
  }
}

export function getBuilderChromeCopyForContext(context: CharacterBuildContext): BuilderChromeCopy {
  const acquisitionKind = isCampaignBuildContext(context)
    ? context.acquisition.kind
    : ('standalone' as const)

  return getBuilderChromeCopy(
    context.characterKind,
    resolveCampaignIdFromContext(context),
    acquisitionKind,
  )
}

function isCampaignBuildContext(context: CharacterBuildContext): context is CampaignBuildContext {
  return 'acquisition' in context
}

export function resolveBuilderStepDescription(
  stepId: CharacterBuilderStepId,
  stepDescription: string,
  context: CharacterBuildContext,
): string {
  if (stepId === 'review' && context.characterKind === 'npc') {
    return getBuilderChromeCopyForContext(context).reviewStepDescription
  }

  return stepDescription
}
