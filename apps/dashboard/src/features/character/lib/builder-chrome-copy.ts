import type { CharacterBuildContext, CharacterBuilderStepId, CharacterKind } from '@rpg/contracts'

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

export function getBuilderChromeCopy(
  characterKind: CharacterKind,
  campaignId?: string,
): BuilderChromeCopy {
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
      importLabel: 'Import NPC (experimental)',
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
    importLabel: 'Import character (experimental)',
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
  return getBuilderChromeCopy(context.characterKind, resolveCampaignIdFromContext(context))
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
