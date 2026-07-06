import {
  getUnlockedGrantsAtLevel,
  resolveGrantGroupsFromContent,
  type ContentGrant,
  type GrantGroupSource,
  type GrantUnlock,
} from '../../../../content/lib/grants'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import { contentGrantToChoiceSets, type GrantChoiceSetContext } from './grant-choice-sets'

export function unlockedGrantChoiceSets(
  content: GrantGroupSource,
  catalogIndex: CharacterBuildCatalogIndex,
  ctx: GrantChoiceSetContext,
  options: {
    level?: number
    parentLevel?: number
    parentUnlock?: GrantUnlock
    grantSlot?: (grant: ContentGrant, index: number) => string
  } = {},
): ChoiceSet[] {
  const level = options.level ?? 1
  const parentLevel = options.parentLevel ?? 1
  const groups = resolveGrantGroupsFromContent(content, options.parentUnlock)
  const grants = getUnlockedGrantsAtLevel(groups, level, parentLevel)

  return grants.flatMap((grant, index) => {
    const slot = options.grantSlot?.(grant, index) ?? `${ctx.slot}:${grant.kind}:${index}`
    return contentGrantToChoiceSets(grant, { ...ctx, slot }, catalogIndex)
  })
}
