import type { CharacterBuilderChromeVariant } from '../character-builder-chrome-variant'

/** Route-independent builder shell chrome copy (layer 3 workflow strings). */
export type CharacterBuilderChromeMessages = {
  pageHeading: string
  createLabel: string
  creatingLabel: string
  createErrorDefault: string
  exitLabel: string
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

const CHARACTER_BUILDER_CHROME_MESSAGES = {
  standalone_pc: {
    pageHeading: 'New character',
    createLabel: 'Create character',
    creatingLabel: 'Creating…',
    createErrorDefault: 'Could not create character.',
    exitLabel: 'Exit',
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
  },
  campaign_npc: {
    pageHeading: 'New NPC',
    createLabel: 'Create NPC',
    creatingLabel: 'Creating…',
    createErrorDefault: 'Could not create NPC.',
    exitLabel: 'Exit',
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
  },
  campaign_onboarding_pc: {
    pageHeading: 'Create your campaign character',
    createLabel: 'Create campaign character',
    creatingLabel: 'Creating…',
    createErrorDefault: 'Could not create campaign character.',
    exitLabel: 'Back to character choice',
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
  },
} as const satisfies Record<CharacterBuilderChromeVariant, CharacterBuilderChromeMessages>

export function getCharacterBuilderChromeMessages(
  variant: CharacterBuilderChromeVariant,
): CharacterBuilderChromeMessages {
  return CHARACTER_BUILDER_CHROME_MESSAGES[variant]
}
