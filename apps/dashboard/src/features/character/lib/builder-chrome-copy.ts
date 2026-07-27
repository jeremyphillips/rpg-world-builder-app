import {
  getCharacterBuilderChromeMessages,
  resolveCharacterBuilderChromeVariant,
  resolveCampaignIdFromContext,
  type CharacterBuildContext,
  type CharacterBuilderChromeMessages,
  type CharacterBuilderChromeVariant,
} from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

export type BuilderChromeCopy = CharacterBuilderChromeMessages & {
  exitHref: string
  importHref: string | null
}

export { resolveCampaignIdFromContext }

function resolveBuilderChromeRoutes(
  variant: CharacterBuilderChromeVariant,
  campaignId?: string,
): Pick<BuilderChromeCopy, 'exitHref' | 'importHref'> {
  switch (variant) {
    case 'campaign_invite_pc':
      return { exitHref: '#', importHref: null }
    case 'campaign_npc': {
      if (!campaignId) {
        throw new Error('NPC builder chrome requires a campaign id')
      }

      return {
        exitHref: ROUTES.campaign.npcs.list(campaignId),
        importHref: ROUTES.campaign.npcs.import(campaignId),
      }
    }
    case 'standalone_pc':
      return {
        exitHref: ROUTES.characters.list,
        importHref: ROUTES.characters.import,
      }
  }
}

export function getBuilderChromeCopy(
  variant: CharacterBuilderChromeVariant,
  campaignId?: string,
): BuilderChromeCopy {
  return {
    ...getCharacterBuilderChromeMessages(variant),
    ...resolveBuilderChromeRoutes(variant, campaignId),
  }
}

export function getBuilderChromeCopyForContext(context: CharacterBuildContext): BuilderChromeCopy {
  const variant = resolveCharacterBuilderChromeVariant(context)

  return getBuilderChromeCopy(variant, resolveCampaignIdFromContext(context))
}
