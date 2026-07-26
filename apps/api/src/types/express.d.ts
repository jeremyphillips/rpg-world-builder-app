import type { CampaignRole, SessionUser } from '@rpg/contracts'

declare global {
  namespace Express {
    interface Request {
      /** Populated by `requireAuth` once a valid session cookie is verified. */
      user?: SessionUser
      /**
       * Populated by `requireCampaignRole` after verifying campaign membership.
       * Available to downstream route handlers on campaign-scoped routes.
       */
      campaignMembership?: {
        campaignId: string
        userId: string
        campaignRole: CampaignRole
        controlledCharacterIds: string[]
        /** Pre-resolved viewer PC ids: controlledCharacterIds ∩ open participations. */
        pcCharacterIds: string[]
      }
    }
  }
}

export {}
