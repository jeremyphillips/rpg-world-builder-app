import { midSentenceLabel } from '@rpg/contracts'

export const LOCATION_CREATE_SETUP_CHANGE_LABEL = 'Change' as const

/**
 * Opt-in generic setup modal subhead. Pass as `subhead` when a setup needs
 * introductory context beyond choice-set questions.
 */
export function resolveLocationCreateSetupDefaultSubhead(contextualNoun: string): string {
  return `Choose the options that best describe this ${midSentenceLabel(contextualNoun)}.`
}
