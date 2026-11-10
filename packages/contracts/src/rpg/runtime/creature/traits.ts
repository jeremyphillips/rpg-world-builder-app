import { isBodyRowAvailable } from '../../content/lib/campaign-access/body-row-availability'
import type { ContentGrant, GrantGroups } from '../../content/lib/grants'
import { resolveGrantGroupsFromContent } from '../../content/lib/grants'
import {
  readCreatureTraitTemplateConfig,
  type CreatureTraitGrantBody,
} from '../../content/creature/traits/templates'

// ---------------------------------------------------------------------------
// Expands species and monster trait rows into grants. Template mechanics come
// from the registry. The same template id collapses to one grant with every
// contributing source kept.
// ---------------------------------------------------------------------------

/**
 * Trait-shaped row. Class features include kinds such as `subclass-choice`
 * that are not content traits; those still contribute `grantGroups`.
 */
export type CreatureTraitRow = {
  kind: string
  id: string
  name?: string
  available?: boolean
  grantGroups?: GrantGroups
  templateId?: string
  config?: unknown
}

export type CreatureTraitAssignment<TSource> = {
  trait: CreatureTraitRow
  source: TSource
  /** Level used when a grant group has no unlock. Species traits use 1. */
  parentLevel?: number
}

export type ResolvedCreatureTraitGrant<TSource> = {
  grant: ContentGrant
  sources: TSource[]
  unlockLevel: number
  templateId?: string
}

function templateEffectId(templateId: string, index: number): string {
  return index === 0 ? `${templateId}-effect` : `${templateId}-effect-${index + 1}`
}

function grantFromTemplateBody(
  templateId: string,
  index: number,
  body: CreatureTraitGrantBody,
): ContentGrant {
  return { id: templateEffectId(templateId, index), ...body }
}

type PendingGrant<TSource> = {
  grant: ContentGrant
  sources: TSource[]
  unlockLevel: number
  templateKey?: string
}

function grantsFromTrait<TSource>(
  assignment: CreatureTraitAssignment<TSource>,
): PendingGrant<TSource>[] {
  const parentLevel = assignment.parentLevel ?? 1
  const { trait, source } = assignment

  if (trait.kind === 'template') {
    const templateId = trait.templateId
    if (!templateId) return []
    const read = readCreatureTraitTemplateConfig(templateId, trait.config)
    if (!read) return []
    return read.template.resolveGrants(read.config).map((body, index) => ({
      grant: grantFromTemplateBody(templateId, index, body),
      sources: [source],
      unlockLevel: parentLevel,
      templateKey: `${templateId}:${index}`,
    }))
  }

  return resolveGrantGroupsFromContent(trait).flatMap((group) => {
    const unlockLevel = group.unlock?.level ?? parentLevel
    return group.grants.map((grant) => ({
      grant,
      sources: [source],
      unlockLevel,
    }))
  })
}

/**
 * Expands available trait rows into grants. Unavailable rows are dropped.
 * Repeated `templateId` values become one grant; sources are concatenated and
 * the earliest unlock level is kept. The first resolved payload wins.
 */
export function resolveCreatureTraitGrants<TSource>(
  assignments: readonly CreatureTraitAssignment<TSource>[],
): ResolvedCreatureTraitGrant<TSource>[] {
  const merged = new Map<string, PendingGrant<TSource>>()
  const order: string[] = []

  for (const assignment of assignments) {
    if (!isBodyRowAvailable(assignment.trait)) continue
    for (const pending of grantsFromTrait(assignment)) {
      const key = pending.templateKey ?? `row:${pending.grant.id}:${order.length}`
      const existing = merged.get(key)
      if (!existing) {
        merged.set(key, pending)
        order.push(key)
        continue
      }
      existing.sources.push(...pending.sources)
      existing.unlockLevel = Math.min(existing.unlockLevel, pending.unlockLevel)
    }
  }

  return order.map((key) => {
    const pending = merged.get(key)!
    return {
      grant: pending.grant,
      sources: pending.sources,
      unlockLevel: pending.unlockLevel,
      ...(pending.templateKey
        ? { templateId: pending.templateKey.slice(0, pending.templateKey.lastIndexOf(':')) }
        : {}),
    }
  })
}
