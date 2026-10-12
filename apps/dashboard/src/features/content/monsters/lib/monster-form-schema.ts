import {
  addApiValidationIssueToRefinement,
  collectMonsterCatalogIssues,
  type MonsterCatalogs,
  monsterBodyDraftSchema,
  monsterBodySchema,
  type ContentValidationIntent,
} from '@rpg/contracts'
import { z } from 'zod'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  movementRowsToRecordForPreview,
  refineMovementRows,
  type MovementRowDraftFormValues,
} from '../../lib/forms/fields/content-movement-form-fields'
import { stripMonsterHitPointsAuthoringFields } from './monster-hit-points-form.lib'

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function adaptMonsterFormMovementForBodySchema(input: unknown): unknown {
  if (!isRecord(input)) return input
  const stripped = stripMonsterHitPointsAuthoringFields(input)
  const movement = stripped.movement
  if (!Array.isArray(movement)) return stripped
  return {
    ...stripped,
    movement: movementRowsToRecordForPreview(movement as MovementRowDraftFormValues[]),
  }
}

/** Draft or publish body schema plus the shared catalog collector. */
export function resolveMonsterFormSchema(
  ctx: ContentFormCtx,
  intent: ContentValidationIntent = 'publish',
) {
  const base = intent === 'draft' ? monsterBodyDraftSchema : monsterBodySchema
  return z
    .unknown()
    .superRefine((input, refinementCtx) => {
      if (!isRecord(input) || !Array.isArray(input.movement)) return
      refineMovementRows(input.movement as MovementRowDraftFormValues[], refinementCtx)
    })
    .pipe(z.preprocess(adaptMonsterFormMovementForBodySchema, base))
    .superRefine((body, refinement) => {
      for (const issue of collectMonsterCatalogIssues(
        body,
        buildMonsterFormCatalogs(ctx),
        intent,
      )) {
        addApiValidationIssueToRefinement(refinement, issue)
      }
    })
}
