import type { ContentGrant, GrantGroupSource, GrantUnlock } from '../../../../content/lib/grants'
import { resolveMechanicalGrantsFromContent } from '../../../creature/mechanical-grants'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'
import { contentGrantToChoiceSets, type GrantChoiceSetContext } from './grant-choice-sets'

export function unlockedGrantChoiceSets(
  content: GrantGroupSource & {
    id?: string
    templateId?: string
    config?: unknown
    available?: boolean
  },
  catalogIndex: CharacterBuildCatalogIndex,
  ctx: GrantChoiceSetContext,
  options: {
    level?: number
    parentLevel?: number
    parentUnlock?: GrantUnlock
    grantSlot?: (grant: ContentGrant, index: number) => string
    source?: string
  } = {},
): ChoiceSet[] {
  const level = options.level ?? 1
  const parentLevel = options.parentLevel ?? 1
  const grants = resolveMechanicalGrantsFromContent(content, {
    level,
    parentLevel,
    parentUnlock: options.parentUnlock,
    source: options.source,
  })

  return grants.flatMap((grant, index) => {
    const slot = options.grantSlot?.(grant, index) ?? `${ctx.slot}:grant:${grant.id}`
    return contentGrantToChoiceSets(grant, { ...ctx, slot }, catalogIndex)
  })
}
