import type { ResolvedContentCampaignAccess } from '@rpg/contracts'

import type { ContentFormCtx } from '../forms/registry/content-form-registry'

export type FormEmbeddedMasterDetailAccessConfig =
  | { kind: 'availability'; fieldName: 'available' }
  | {
      kind: 'campaignAccess'
      fieldName: 'campaignAccess'
      resolveParentAccess: (ctx: { formCtx: ContentFormCtx }) => ResolvedContentCampaignAccess
    }

/** @deprecated Use `access={{ kind: 'availability', fieldName }}` instead. */
export type FormEmbeddedMasterDetailAvailabilityConfig = {
  fieldName: string
}

export function normalizeFormEmbeddedMasterDetailAccess(
  access?: FormEmbeddedMasterDetailAccessConfig,
  availability?: FormEmbeddedMasterDetailAvailabilityConfig,
): FormEmbeddedMasterDetailAccessConfig | undefined {
  if (access) return access
  if (availability) {
    return { kind: 'availability', fieldName: 'available' }
  }
  return undefined
}
