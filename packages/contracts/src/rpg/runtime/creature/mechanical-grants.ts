import type { ContentGrant, GrantGroupSource, GrantUnlock } from '../../content/lib/grants'
import { getUnlockedGrantsAtLevel, resolveGrantGroupsFromContent } from '../../content/lib/grants'
import { isBodyRowAvailable } from '../../content/lib/campaign-access/body-row-availability'
import { resolveCreatureTraitGrants, type CreatureTraitRow } from './traits'

export type MechanicalGrantContent = GrantGroupSource & {
  id?: string
  templateId?: string
  config?: unknown
  available?: boolean
}

/**
 * Resolves mechanical grants for one trait-shaped row — stored grant groups or
 * projected template grants. Form hydration still uses `resolveGrantGroupsFromContent`.
 */
function mechanicalGrantsFromTemplate(
  content: MechanicalGrantContent,
  parentLevel: number,
  source?: string,
): ContentGrant[] {
  const templateId = content.templateId
  if (!templateId) return []
  const trait: CreatureTraitRow = {
    kind: 'template',
    id: content.id ?? templateId,
    templateId,
    config: content.config,
    available: content.available,
  }
  return resolveCreatureTraitGrants([{ trait, source: source ?? trait.id, parentLevel }]).map(
    (resolved) => resolved.grant,
  )
}

export function resolveMechanicalGrantsFromContent(
  content: MechanicalGrantContent,
  options?: {
    parentLevel?: number
    level?: number
    parentUnlock?: GrantUnlock
    source?: string
  },
): ContentGrant[] {
  if (!isBodyRowAvailable(content)) return []

  const parentLevel = options?.parentLevel ?? 1
  const level = options?.level ?? parentLevel

  if (content.kind === 'template') {
    return mechanicalGrantsFromTemplate(content, parentLevel, options?.source)
  }

  const groups = resolveGrantGroupsFromContent(content, options?.parentUnlock)
  return getUnlockedGrantsAtLevel(groups, level, parentLevel)
}
