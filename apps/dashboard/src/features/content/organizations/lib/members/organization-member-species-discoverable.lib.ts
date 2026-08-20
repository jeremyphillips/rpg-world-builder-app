import type { Species } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'

/** Campaign-eligible species for organization member species affinity authoring. */
export function resolveDiscoverableOrganizationMemberSpecies(ctx: ContentFormCtx): Species[] {
  return ctx.options?.species?.forCampaignUse() ?? []
}

/** Full campaign species catalog rows for orphan chip resolution (may exceed discoverable set). */
export function resolveOrganizationMemberSpeciesCatalogSpecies(ctx: ContentFormCtx): Species[] {
  return [...(ctx.options?.species?.visible ?? [])]
}
