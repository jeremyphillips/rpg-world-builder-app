import { z } from 'zod'
import {
  contentTraitKindSchema,
  defineMessage,
  fieldValidationMessages,
  isGrantGroupsEligible,
  resolveTraitName,
  type ContentTraitKind,
  type GrantGroups,
} from '@rpg/contracts'
import { type FieldVisibility, type FormItem } from '@rpg/ui/form'

import { grantArrayFields } from '../../lib/forms/grants/grant-form-fields'
import {
  GRANT_TYPES,
  GRANT_TYPE_LABELS,
  grantRowFormSchema,
} from '../../lib/forms/grants/grant-form-schema'
import { formRowsToGrantGroups } from '../../lib/forms/grants/grant-form-values'
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
    grants: z.array(grantRowFormSchema),
  })
}

export function refinePublishedTraitRow(
  row: {
    kind?: string
    name?: string
    grants: z.infer<typeof grantRowFormSchema>[]
  },
  ctx: z.RefinementCtx,
): void {
  if (row.kind === 'custom' && !row.name?.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: fieldValidationMessages.requiredText({ label: 'Name' }),
      path: ['name'],
    })
  }
  if (row.kind === 'grant') {
    const grantGroups = formRowsToGrantGroups(row.grants)
    if (!isGrantGroupsEligible(grantGroups)) {
      ctx.addIssue({
        code: 'custom',
        message: speciesTraitValidationMessages.grantRowRequired(),
        path: ['grants'],
      })
    }
  }
}

export const traitRowDraftFormSchema = traitRowObjectSchema(
  contentTraitKindSchema.default('custom'),
)

export const traitRowFormSchema = traitRowDraftFormSchema.superRefine(refinePublishedTraitRow)

export function heritageOptionRowObjectSchema() {
  return traitRowObjectSchema(z.literal('custom').default('custom'))
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
    ...grantArrayFields(GRANT_TYPES, GRANT_TYPE_LABELS, ctx),
  ]
}

/** Heritage options always use authored custom traits. */
export function heritageOptionItemFields(ctx: ContentFormCtx): FormItem[] {
  return traitItemFields(ctx)
}

export function traitItemTitle(values: Record<string, unknown>, index: number): string {
  const row = values as TraitRowForm
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
