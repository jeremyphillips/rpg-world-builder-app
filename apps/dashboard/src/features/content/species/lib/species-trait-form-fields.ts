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
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { traitKindOptions } from './species-trait-form-labels'

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

export const traitRowFormSchema = z
  .object({
    id: z.string().min(1).optional(),
    kind: contentTraitKindSchema.default('custom'),
    /** Form-only — not persisted; derived from stored overrides on load. */
    overrideDisplay: z.boolean().default(false),
    name: z.string().optional(),
    description: z.string().optional(),
    nameOverride: z.string().optional(),
    descriptionOverride: z.string().optional(),
    grants: z.array(grantRowFormSchema),
  })
  .superRefine((row, ctx) => {
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
  })

/** Draft trait row — skips publish completeness checks (empty grants, blank names). */
export const traitRowDraftFormSchema = z.object({
  id: z.string().min(1).optional(),
  kind: contentTraitKindSchema.default('custom'),
  overrideDisplay: z.boolean().default(false),
  name: z.string().optional(),
  description: z.string().optional(),
  nameOverride: z.string().optional(),
  descriptionOverride: z.string().optional(),
  grants: z.array(grantRowFormSchema),
})

export type TraitRowForm = z.infer<typeof traitRowFormSchema>

export function traitItemFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'select',
      name: 'kind',
      label: 'Trait kind',
      options: traitKindOptions,
      required: true,
      defaultValue: 'custom',
    },
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
      type: 'switch',
      name: 'overrideDisplay',
      label: 'Custom name and description',
      visibility: visibleForTraitKind('grant'),
    },
    {
      type: 'text',
      name: 'nameOverride',
      label: 'Custom name',
      placeholder: 'Leave blank to use the default',
      visibility: visibleForGrantOverrides(),
    },
    {
      type: 'richtext',
      name: 'descriptionOverride',
      label: 'Custom description',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
      hint: 'Leave blank to use the default',
      visibility: visibleForGrantOverrides(),
    },
    ...grantArrayFields(GRANT_TYPES, GRANT_TYPE_LABELS, ctx),
  ]
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
    return `Grant trait ${index + 1}`
  }
  return row.name || `Trait ${index + 1}`
}

export function traitItemEyebrow(row: TraitRowForm | undefined): string | undefined {
  if (!row?.kind) return undefined
  return row.kind === 'grant' ? 'Grant' : 'Custom'
}
