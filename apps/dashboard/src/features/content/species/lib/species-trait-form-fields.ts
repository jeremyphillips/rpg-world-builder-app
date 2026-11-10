import { z } from 'zod'
import {
  addCustomRefinementIssue,
  collectCreatureTraitTemplateIssues,
  contentTraitKindSchema,
  defineMessage,
  fieldValidationMessages,
  isGrantGroupsEligible,
  resolveTraitName,
  type ContentTraitKind,
  type GrantGroups,
} from '@rpg/contracts'
import { type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { creatureTraitTemplateFields } from '../../lib/creature-traits/creature-trait-template-fields'
import { grantArrayFields } from '../../lib/forms/grants/grant-form-fields'
import {
  GRANT_TYPES,
  GRANT_TYPE_LABELS,
  grantRowFormSchema,
} from '../../lib/forms/grants/grant-form-schema'
import {
  formRowToContentGrant,
  formRowsToGrantGroups,
} from '../../lib/forms/grants/grant-form-values'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  TRAIT_DERIVED_DISPLAY_DESCRIPTION,
  TRAIT_OVERRIDE_DISPLAY_LABEL,
} from './species-trait-form-labels'

/** Species trait row validation messages (tier 3 form overrides). */
export const speciesTraitValidationMessages = {
  grantRowRequired: defineMessage(
    'validation.speciesTrait.grantRowRequired',
    () => 'Grant traits require one eligible grant row',
    () => 'Missing grant row',
  ),
}

export function visibleForTraitKind(kind: ContentTraitKind): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (watched) => watched['kind'] === kind,
  }
}

/** Form-only: reveals name/description override fields for grant traits. */
export function visibleForGrantOverrides(): FieldVisibility {
  return {
    dependsOn: ['kind', 'overrideDisplay'],
    visibleWhen: (watched) => watched['kind'] === 'grant' && watched['overrideDisplay'] === true,
  }
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
    descriptionOverride: z.string().optional(),
    templateId: z.string().min(1).optional(),
    config: z
      .object({
        uses: z.coerce.number().int().min(1).optional(),
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
    config?: { uses?: number }
    grants: z.infer<typeof grantRowFormSchema>[]
  },
  ctx: z.RefinementCtx,
): void {
  if (row.kind === 'custom' && !row.name?.trim()) {
    addCustomRefinementIssue(ctx, fieldValidationMessages.requiredText({ label: 'Name' }), ['name'])
  }
  if (row.kind === 'template') {
    for (const issue of collectCreatureTraitTemplateIssues([
      { kind: 'template', templateId: row.templateId, config: row.config },
    ])) {
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

export function traitItemFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'text',
      name: 'name',
      label: 'Name',
      required: true,
      visibility: visibleForTraitKind('custom'),
    },
    {
      type: 'richtext',
      name: 'description',
      label: 'Description',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
      visibility: visibleForTraitKind('custom'),
    },
    {
      kind: 'group',
      description: TRAIT_DERIVED_DISPLAY_DESCRIPTION,
      visibility: visibleForTraitKind('grant'),
      fields: [
        {
          type: 'switch',
          name: 'overrideDisplay',
          label: TRAIT_OVERRIDE_DISPLAY_LABEL,
        },
        {
          type: 'text',
          name: 'nameOverride',
          label: 'Name',
          placeholder: 'Leave blank to use the default',
          visibility: visibleForGrantOverrides(),
        },
        {
          type: 'richtext',
          name: 'descriptionOverride',
          label: 'Description',
          linkable: true,
          internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
          contentTypeOptions: ctx.options?.richTextContentTypeOptions,
          hint: 'Leave blank to use the default',
          visibility: visibleForGrantOverrides(),
        },
      ],
    },
    ...creatureTraitTemplateFields(),
    ...grantArrayFields(GRANT_TYPES, GRANT_TYPE_LABELS, ctx).map((field) => ({
      ...field,
      visibility: {
        dependsOn: ['kind'],
        visibleWhen: (watched: Record<string, unknown>) => watched['kind'] !== 'template',
      },
    })),
  ]
}

/** Heritage options always use authored custom traits. */
export function heritageOptionItemFields(ctx: ContentFormCtx): FormItem[] {
  return traitItemFields(ctx)
}

export function traitItemTitle(values: Record<string, unknown>, index: number): string {
  const row = values as TraitRowForm
  if (row.kind === 'template' && row.templateId) {
    return resolveTraitName({
      kind: 'template',
      id: row.id ?? `trait-${index}`,
      templateId: row.templateId,
      config: row.config,
      nameOverride: row.nameOverride,
      descriptionOverride: row.descriptionOverride,
    })
  }
  if (row.kind === 'grant') {
    const grantGroups: GrantGroups = formRowsToGrantGroups(row.grants)
    if (isGrantGroupsEligible(grantGroups)) {
      return resolveTraitName({
        kind: 'grant',
        id: row.id ?? `trait-${index}`,
        grantGroups,
        nameOverride: row.nameOverride,
        descriptionOverride: row.descriptionOverride,
      })
    }
  }
  return row.name?.trim() || ''
}
