import type { CharacterClass } from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'

/** Campaign-discoverable classes for organization member class affinity authoring. */
export function resolveDiscoverableOrganizationMemberClasses(
  ctx: ContentFormCtx,
): CharacterClass[] {
  return ctx.options?.classEntities ?? []
}

/** Full campaign class catalog rows for orphan chip resolution (may exceed discoverable set). */
export function resolveOrganizationMemberClassCatalogClasses(
  ctx: ContentFormCtx,
): CharacterClass[] {
  return ctx.options?.campaignClassEntities ?? ctx.options?.classEntities ?? []
}
