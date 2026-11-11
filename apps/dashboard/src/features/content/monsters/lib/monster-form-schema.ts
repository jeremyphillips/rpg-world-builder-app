import {
  addApiValidationIssueToRefinement,
  addCustomRefinementIssue,
  collectMonsterCatalogIssues,
  type MonsterCatalogs,
  monsterBodyDraftSchema,
  monsterBodySchema,
  type ContentValidationIntent,
} from '@rpg/contracts'
import { z } from 'zod'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  refineMovementRows,
  type MovementRowDraftFormValues,
} from '../../lib/forms/fields/content-movement-form-fields'
import { normalizeMonsterFormValues } from './normalize-monster-form-values'
import { stripMonsterHitPointsAuthoringFields } from './statistics/monster-hit-points-form.lib'
import type { MonsterFormValues } from './monster-form-values'

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
    spellsById: ctx.spellCatalogById,
    spellCatalog: catalogLoadStatus(ctx.spellCatalogStatus),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function preprocessMonsterFormValuesForBodySchema(
  input: unknown,
  ctx: ContentFormCtx,
  intent: ContentValidationIntent,
): unknown {
  if (!isRecord(input)) return input
  const stripped = stripMonsterHitPointsAuthoringFields(input)
  return normalizeMonsterFormValues(stripped as MonsterFormValues, {
    intent,
    mode: 'create',
    armorClassRules: ctx.armorClassRules,
  })
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
      if (intent === 'publish' && input.weaponProficiencyReconciliationPending === true) {
        addCustomRefinementIssue(
          refinementCtx,
          'Resolve stored weapon proficiencies by choosing a weapon proficiency mode.',
          ['weaponProficiencyMode'],
        )
      }
    })
    .pipe(
      z.preprocess((input) => preprocessMonsterFormValuesForBodySchema(input, ctx, intent), base),
    )
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
