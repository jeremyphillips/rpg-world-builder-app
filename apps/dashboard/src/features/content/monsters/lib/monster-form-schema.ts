import {
  addApiValidationIssueToRefinement,
  collectMonsterCatalogIssues,
  type MonsterCatalogs,
  monsterBodyDraftSchema,
  monsterBodySchema,
  type ContentValidationIntent,
} from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

function catalogLoadStatus(
  status: ContentFormCtx['equipmentCatalogStatus'],
): MonsterCatalogs['equipmentCatalog'] {
  return status === 'ready' ? 'ready' : 'unavailable'
}

function buildMonsterFormCatalogs(ctx: ContentFormCtx): MonsterCatalogs {
  return {
    equipmentById: ctx.equipmentCatalogById ?? new Map(),
    skillBySlug: ctx.skillCatalogBySlug ?? new Map(),
    equipmentCatalog: catalogLoadStatus(ctx.equipmentCatalogStatus),
    skillCatalog: catalogLoadStatus(ctx.skillCatalogStatus),
  }
}

/** Draft or publish body schema plus the shared catalog collector. */
export function resolveMonsterFormSchema(
  ctx: ContentFormCtx,
  intent: ContentValidationIntent = 'publish',
) {
  const base = intent === 'draft' ? monsterBodyDraftSchema : monsterBodySchema
  return base.superRefine((body, refinement) => {
    for (const issue of collectMonsterCatalogIssues(body, buildMonsterFormCatalogs(ctx), intent)) {
      addApiValidationIssueToRefinement(refinement, issue)
    }
  })
}
