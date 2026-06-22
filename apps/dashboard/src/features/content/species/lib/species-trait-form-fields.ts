import { z } from 'zod'
import {
  CONTENT_TRAIT_KINDS,
  contentTraitKindSchema,
  getTraitGrants,
  isGrantEligibleGrants,
  resolveTraitName,
  type ContentTrait,
} from '@rpg/contracts'
import { toOptions, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import {
  SPECIES_GRANT_TYPES,
  SPECIES_GRANT_TYPE_LABELS,
  formRowsToGrants,
  grantArrayFields,
  grantRowFormSchema,
  grantsToFormRows,
} from '../../lib/grant-form-helpers'
import { applyStableIdsForUpdate } from '../../lib/content-form-key-helpers'
import type { ContentFormCtx } from '../../lib/content-form-registry'

export const traitKindOptions = toOptions(CONTENT_TRAIT_KINDS, {
  custom: 'Custom',
  grant: 'From grants',
} as Record<(typeof CONTENT_TRAIT_KINDS)[number], string>)

export function visibleForTraitKind(kind: (typeof CONTENT_TRAIT_KINDS)[number]): FieldVisibility {
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
      ctx.addIssue({ code: 'custom', message: 'Name is required', path: ['name'] })
    }
    if (row.kind === 'grant') {
      const grants = formRowsToGrants(row.grants)
      if (!grants || !isGrantEligibleGrants(grants)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Grant traits require one eligible grant row',
          path: ['grants'],
        })
      }
    }
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
      hint: 'Leave blank to use the default',
      visibility: visibleForGrantOverrides(),
    },
    ...grantArrayFields(SPECIES_GRANT_TYPES, SPECIES_GRANT_TYPE_LABELS, ctx),
  ]
}

export function traitItemTitle(values: Record<string, unknown>, index: number): string {
  const row = values as TraitRowForm
  if (row.kind === 'grant') {
    const grants = formRowsToGrants(row.grants)
    if (grants && isGrantEligibleGrants(grants)) {
      return resolveTraitName({
        kind: 'grant',
        id: row.id ?? `trait-${index}`,
        grants,
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

export function traitToFormRow(trait: ContentTrait): TraitRowForm {
  const grants = grantsToFormRows(getTraitGrants(trait))
  if (trait.kind === 'grant') {
    const hasOverrides = Boolean(trait.nameOverride || trait.descriptionOverride)
    return {
      id: trait.id,
      kind: 'grant',
      overrideDisplay: hasOverrides,
      nameOverride: trait.nameOverride,
      descriptionOverride: trait.descriptionOverride,
      grants,
    }
  }
  return {
    id: trait.id,
    kind: 'custom',
    overrideDisplay: false,
    name: trait.name,
    description: trait.description,
    grants,
  }
}

export function traitFromFormRow(row: TraitRowForm & { id: string }): ContentTrait {
  const grants = formRowsToGrants(row.grants)
  if (row.kind === 'grant') {
    return {
      kind: 'grant',
      id: row.id,
      grants: grants!,
      nameOverride: row.nameOverride || undefined,
      descriptionOverride: row.descriptionOverride || undefined,
    }
  }
  return {
    kind: 'custom',
    id: row.id,
    name: row.name!,
    description: row.description || undefined,
    grants,
  }
}

export function traitRowNameForIdAssignment(row: TraitRowForm, index: number): string {
  if (row.kind === 'grant') {
    return row.nameOverride?.trim() || traitItemTitle(row, index)
  }
  return row.name?.trim() || `Trait ${index + 1}`
}

export function traitRowsWithNamesForIdAssignment(
  rows: TraitRowForm[],
): Array<TraitRowForm & { name: string }> {
  return rows.map((row, index) => ({
    ...row,
    name: traitRowNameForIdAssignment(row, index),
  }))
}

export function traitsFromFormValues(
  rows: TraitRowForm[],
  existing?: readonly ContentTrait[],
): ContentTrait[] {
  return applyStableIdsForUpdate(traitRowsWithNamesForIdAssignment(rows), existing).map(
    traitFromFormRow,
  )
}
