import { z } from 'zod'
import {
  addCustomRefinementIssue,
  collectCreatureTraitTemplateIssues,
  contentTraitKindSchema,
  defineMessage,
  fieldValidationMessages,
  isGrantGroupsEligible,
} from '@rpg/contracts'

import { grantRowFormSchema } from '../../lib/forms/grants/grant-form-schema'
import {
  formRowToContentGrant,
  formRowsToGrantGroups,
} from '../../lib/forms/grants/grant-form-values'

/** Species trait row validation messages (tier 3 form overrides). */
export const speciesTraitValidationMessages = {
  grantRowRequired: defineMessage(
    'validation.speciesTrait.grantRowRequired',
    () => 'Grant traits require one eligible grant row',
    () => 'Missing grant row',
  ),
}

function traitRowObjectSchema<Kind extends z.ZodType>(kindSchema: Kind) {
  return z.object({
    id: z.string().min(1).optional(),
    kind: kindSchema,
    /** Form-only — not persisted; derived from stored overrides on load. */
    overrideDisplay: z.boolean().default(false),
    name: z.string().optional(),
    description: z.string().optional(),
    nameOverride: z.string().optional(),
    details: z.string().optional(),
    templateId: z.string().min(1).optional(),
    config: z
      .object({
        uses: z
          .union([
            z.coerce.number().int().min(1),
            z.object({
              normal: z.coerce.number().int().min(1),
              inLair: z.coerce.number().int().min(1).optional(),
            }),
          ])
          .optional(),
        range: z.coerce.number().int().min(0).optional(),
      })
      .optional(),
    grants: z.array(grantRowFormSchema),
  })
}

export function refinePublishedTraitRow(
  row: {
    kind?: string
    name?: string
    templateId?: string
    config?: {
      uses?: number | { normal: number; inLair?: number }
      range?: number
    }
    grants: z.infer<typeof grantRowFormSchema>[]
  },
  ctx: z.RefinementCtx,
): void {
  if (row.kind === 'custom' && !row.name?.trim()) {
    addCustomRefinementIssue(ctx, fieldValidationMessages.requiredText({ label: 'Name' }), ['name'])
  }
  if (row.kind === 'template') {
    for (const issue of collectCreatureTraitTemplateIssues(
      [{ kind: 'template', templateId: row.templateId, config: row.config }],
      { host: 'species' },
    )) {
      addCustomRefinementIssue(ctx, issue.message, issue.path.slice(1))
    }
  }
  if (row.kind === 'grant') {
    if (row.grants.length === 0) {
      addCustomRefinementIssue(ctx, speciesTraitValidationMessages.grantRowRequired(), ['grants'])
      return
    }

    const grantGroups = formRowsToGrantGroups(row.grants)
    if (!isGrantGroupsEligible(grantGroups)) {
      const hasCompleteGrantRow = row.grants.some((grantRow) => formRowToContentGrant(grantRow))
      if (!hasCompleteGrantRow) return

      addCustomRefinementIssue(ctx, speciesTraitValidationMessages.grantRowRequired(), ['grants'])
    }
  }
}

export const traitRowDraftFormSchema = traitRowObjectSchema(
  contentTraitKindSchema.default('custom'),
).extend({
  available: z.boolean().default(true),
})

export const traitRowFormSchema = traitRowDraftFormSchema.superRefine(refinePublishedTraitRow)

const heritageCampaignAccessFormSchema = z.object({
  available: z.boolean().default(true),
  visibilityMode: z.enum(['all_players', 'dm_only', 'specific_players']).default('all_players'),
  participantIds: z.array(z.string()).default([]),
})

export function heritageOptionRowObjectSchema() {
  return traitRowObjectSchema(z.literal('custom').default('custom')).extend({
    campaignAccess: heritageCampaignAccessFormSchema.default(
      heritageCampaignAccessFormSchema.parse({}),
    ),
  })
}

export function createHeritageOptionCampaignAccessDefaults() {
  return heritageCampaignAccessFormSchema.parse({})
}

export type TraitRowForm = z.infer<typeof traitRowFormSchema>
