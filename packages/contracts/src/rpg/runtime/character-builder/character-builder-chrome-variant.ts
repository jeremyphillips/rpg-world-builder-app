import { isCampaignBuildContext, type CharacterBuildContext } from './context'

export const CHARACTER_BUILDER_CHROME_VARIANTS = [
  'standalone_pc',
  'campaign_npc',
  'campaign_onboarding_pc',
] as const

export type CharacterBuilderChromeVariant = (typeof CHARACTER_BUILDER_CHROME_VARIANTS)[number]

/** Maps a build context to the builder chrome message variant. */
export function resolveCharacterBuilderChromeVariant(
  context: CharacterBuildContext,
): CharacterBuilderChromeVariant {
  if (isCampaignBuildContext(context)) {
    if (context.acquisition.kind === 'campaign_npc') return 'campaign_npc'
    return 'campaign_onboarding_pc'
  }

  return 'standalone_pc'
}
