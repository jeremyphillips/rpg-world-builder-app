import { z } from 'zod'
import {
  MAX_CHARACTER_LEVEL,
  addCustomRefinementIssue,
  campaignLevelSchema,
  classFeatureKindSchema,
  classValidationMessages,
  contentTableSchema,
} from '@rpg/contracts'

import {
  GRANT_DEFAULT_UNLOCK_LEVEL,
  createGrantRowFormSchema,
} from '../../lib/forms/grants/grant-form-schema'

function refineFeatureRowGrantUnlockLevels(
  row: { level: number; grants?: { unlockLevel?: number | string }[] },
  ctx: z.RefinementCtx,
): void {
  for (const [index, grant] of (row.grants ?? []).entries()) {
    const unlockLevel = grant.unlockLevel
    if (unlockLevel === undefined || unlockLevel === GRANT_DEFAULT_UNLOCK_LEVEL) continue

    const numericUnlock = typeof unlockLevel === 'number' ? unlockLevel : Number(unlockLevel)
    if (!Number.isFinite(numericUnlock)) continue

    if (numericUnlock <= row.level) {
      addCustomRefinementIssue(
        ctx,
        classValidationMessages.grantGroupUnlockAfterFeatureLevel({
          unlockLevel: numericUnlock,
          featureLevel: row.level,
        }),
        ['grants', index, 'unlockLevel'],
      )
    }
  }
}

function createFeatureRowBaseFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  const levelField = z.coerce.number().pipe(campaignLevelSchema(maxLevel))
  return z
    .object({
      id: z.string().min(1).optional(),
      kind: classFeatureKindSchema.optional(),
      name: z.string().min(1),
      intro: z.string().optional(),
      description: z.string().optional(),
      level: levelField,
      grants: z.array(createGrantRowFormSchema(maxLevel)),
    })
    .superRefine(refineFeatureRowGrantUnlockLevels)
}

/** Class feature row schema — includes campaign availability. */
export function createFeatureRowFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  return createFeatureRowBaseFormSchema(maxLevel).extend({
    available: z.boolean().default(true),
    tables: z.array(contentTableSchema).default([]),
  })
}

/** Subclass feature rows omit campaign availability. */
export function createSubclassFeatureRowFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  return createFeatureRowBaseFormSchema(maxLevel)
}

/** Draft feature row — name may be empty while authoring. */
export function createFeatureRowDraftFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  const levelField = z.coerce.number().pipe(campaignLevelSchema(maxLevel))
  return z.object({
    id: z.string().min(1).optional(),
    kind: classFeatureKindSchema.optional(),
    name: z.string(),
    description: z.string().optional(),
    level: levelField,
    grants: z.array(createGrantRowFormSchema(maxLevel)),
    available: z.boolean().default(true),
    tables: z.array(contentTableSchema).default([]),
  })
}

export type FeatureRowForm = z.infer<ReturnType<typeof createFeatureRowFormSchema>>
export type SubclassFeatureRowForm = z.infer<ReturnType<typeof createSubclassFeatureRowFormSchema>>
