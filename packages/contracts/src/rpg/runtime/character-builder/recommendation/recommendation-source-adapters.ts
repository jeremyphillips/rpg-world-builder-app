import type { OrganizationNpcClassRecommendationSource } from '../../character/organization-membership/organization-member-class-recommendations'
import type { NpcTemplateId } from '../../../vocab/npc/npc-template'
import type { NpcRecommendationSource } from '../sourced-recommendation'

import type { RecommendationSourceKind, RecommendationSourceRef } from './recommendation-source-ref'

export type RecommendationSourceIdentity = {
  classId?: string
  subclassId?: string
  speciesId?: string
  originId?: string
  featId?: string
  roleId?: NpcTemplateId
  organizationId?: string
  titleId?: string
  titleOrganizationId?: string
}

/** Maps stored NPC recommendation sources onto the shared ref. `template` becomes `role`. */
export function recommendationSourceRefFromNpcRecommendationSource(
  source: NpcRecommendationSource,
  identity: RecommendationSourceIdentity = {},
): RecommendationSourceRef | undefined {
  return recommendationSourceRefFromKind(npcRecommendationSourceKind(source), identity)
}

export function npcRecommendationSourceKind(
  source: NpcRecommendationSource,
): RecommendationSourceKind | undefined {
  switch (source) {
    case 'template':
      return 'role'
    case 'campaign':
      return undefined
    default:
      return source
  }
}

/** Display precedence used by Quick NPC class and role rows. */
export const RECOMMENDATION_DISPLAY_SOURCE_KINDS = ['title', 'organization', 'role'] as const

export type RecommendationDisplaySourceKind = (typeof RECOMMENDATION_DISPLAY_SOURCE_KINDS)[number]

export function recommendationSourceRefFromDisplaySourceKind(
  kind: RecommendationDisplaySourceKind,
  identity: RecommendationSourceIdentity = {},
): RecommendationSourceRef | undefined {
  return recommendationSourceRefFromKind(kind, identity)
}

/** Organization class-affinity sources. `template` becomes `role`. */
export function recommendationSourceRefFromOrganizationClassSource(
  source: OrganizationNpcClassRecommendationSource,
  identity: RecommendationSourceIdentity = {},
): RecommendationSourceRef | undefined {
  const kind = source === 'template' ? 'role' : source
  return recommendationSourceRefFromKind(kind, identity)
}

type IdRefBuilder = (identity: RecommendationSourceIdentity) => RecommendationSourceRef | undefined

const RECOMMENDATION_SOURCE_REF_BUILDERS: Record<RecommendationSourceKind, IdRefBuilder> = {
  class: (identity) => (identity.classId ? { kind: 'class', id: identity.classId } : undefined),
  subclass: (identity) =>
    identity.subclassId ? { kind: 'subclass', id: identity.subclassId } : undefined,
  species: (identity) =>
    identity.speciesId ? { kind: 'species', id: identity.speciesId } : undefined,
  origin: (identity) => (identity.originId ? { kind: 'origin', id: identity.originId } : undefined),
  feat: (identity) => (identity.featId ? { kind: 'feat', id: identity.featId } : undefined),
  role: (identity) => (identity.roleId ? { kind: 'role', id: identity.roleId } : undefined),
  organization: (identity) =>
    identity.organizationId ? { kind: 'organization', id: identity.organizationId } : undefined,
  title: (identity) =>
    identity.titleOrganizationId && identity.titleId
      ? {
          kind: 'title',
          organizationId: identity.titleOrganizationId,
          titleId: identity.titleId,
        }
      : undefined,
  user: () => ({ kind: 'user' }),
}

export function recommendationSourceRefsFromNpcSources(
  sources: readonly NpcRecommendationSource[],
  identity: RecommendationSourceIdentity = {},
): RecommendationSourceRef[] {
  const refs: RecommendationSourceRef[] = []
  const seen = new Set<string>()
  for (const source of sources) {
    const ref = recommendationSourceRefFromNpcRecommendationSource(source, identity)
    if (!ref) continue
    const key = recommendationSourceRefKey(ref)
    if (seen.has(key)) continue
    seen.add(key)
    refs.push(ref)
  }
  return refs
}

function recommendationSourceRefKey(source: RecommendationSourceRef): string {
  if (source.kind === 'title') return `title:${source.organizationId}:${source.titleId}`
  if (source.kind === 'user') return 'user'
  return `${source.kind}:${source.id}`
}

export function recommendationSourceRefFromKind(
  kind: RecommendationSourceKind | undefined,
  identity: RecommendationSourceIdentity,
): RecommendationSourceRef | undefined {
  if (!kind) return undefined
  return RECOMMENDATION_SOURCE_REF_BUILDERS[kind](identity)
}
