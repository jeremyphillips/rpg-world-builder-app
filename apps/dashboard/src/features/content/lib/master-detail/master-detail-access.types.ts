import type { ResolvedContentCampaignAccess } from '@rpg/contracts'

import type { ContentFormCtx } from '../forms/registry/content-form-registry'

export type FormEmbeddedMasterDetailAccessConfig =
  | { kind: 'availability'; fieldName: 'available' }
  | {
      kind: 'campaignAccess'
      fieldName: 'campaignAccess'
      resolveParentAccess: (ctx: { formCtx: ContentFormCtx }) => ResolvedContentCampaignAccess
    }
