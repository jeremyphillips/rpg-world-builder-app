import {
  collectMonsterCatalogIssues,
  monsterBodyDraftSchema,
  monsterBodySchema,
  type ContentValidationIntent,
} from '@rpg/contracts'
import { z } from 'zod'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'

function issuePath(path: string): Array<string | number> {
  return path.split('.').map((segment) => (/^\d+$/.test(segment) ? Number(segment) : segment))
}

/** Draft or publish body schema plus the shared catalog collector. */
export function resolveMonsterFormSchema(
  ctx: ContentFormCtx,
  intent: ContentValidationIntent = 'publish',
) {
  const base = intent === 'draft' ? monsterBodyDraftSchema : monsterBodySchema
  return base.superRefine((body, refinement) => {
    if (ctx.equipmentCatalogStatus === 'ready' && ctx.equipmentCatalogById) {
      for (const issue of collectMonsterCatalogIssues(
        body,
        { equipmentById: ctx.equipmentCatalogById },
        intent,
      )) {
        refinement.addIssue({
          code: z.ZodIssueCode.custom,
          message: issue.message,
          path: issuePath(issue.path),
        })
      }
    }

    if (ctx.skillCatalogStatus !== 'ready') return
    const knownSkills = new Set((ctx.options?.skills?.visible ?? []).map((skill) => skill.id))
    const skills = body.proficiencies?.skills ?? []
    skills.forEach((row, index) => {
      if (!knownSkills.has(row.skill)) {
        refinement.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Unknown skill.',
          path: ['proficiencies', 'skills', index, 'skill'],
        })
      }
    })
  })
}
