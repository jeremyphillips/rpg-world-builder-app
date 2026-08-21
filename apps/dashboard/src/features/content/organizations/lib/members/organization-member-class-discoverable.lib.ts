import type { CharacterClass } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'

/** Campaign-eligible classes for organization member class affinity authoring. */
export function resolveDiscoverableOrganizationMemberClasses(
  ctx: ContentFormCtx,
): CharacterClass[] {
  return ctx.options?.classes?.forCampaignUse() ?? []
}

/** Full campaign class catalog rows for orphan chip resolution (may exceed discoverable set). */
export function resolveOrganizationMemberClassCatalogClasses(
  ctx: ContentFormCtx,
): CharacterClass[] {
  return [...(ctx.options?.classes?.visible ?? [])]
}
