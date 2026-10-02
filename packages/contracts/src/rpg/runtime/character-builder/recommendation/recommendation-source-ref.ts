import type { NpcTemplateId } from '../../../vocab/npc/npc-template'

/**
 * Provenance for a soft recommendation or a requirement owner.
 * `role` is the shared term at this boundary; `NpcTemplate` stays the stored id.
 */
export type RecommendationSourceRef =
  | { kind: 'class' | 'subclass' | 'species' | 'origin' | 'feat'; id: string }
  | { kind: 'role'; id: NpcTemplateId }
  | { kind: 'title'; organizationId: string; titleId: string }
  | { kind: 'organization'; id: string }
  | { kind: 'user' }

export type RecommendationSourceKind = RecommendationSourceRef['kind']

export const RECOMMENDATION_SOURCE_KINDS = [
  'class',
  'subclass',
  'species',
  'origin',
  'feat',
  'role',
  'title',
  'organization',
  'user',
] as const satisfies readonly RecommendationSourceKind[]
