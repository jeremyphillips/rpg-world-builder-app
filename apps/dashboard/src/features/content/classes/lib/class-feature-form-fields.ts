import { z } from 'zod'
import {
  buildLevelOptions,
  campaignLevelSchema,
  MAX_CHARACTER_LEVEL,
  type ClassFeature,
} from '@rpg/contracts'
import { type FieldOption, type FormItem } from '@rpg/ui/form'

import {
  CLASS_GRANT_TYPES,
  CLASS_GRANT_TYPE_LABELS,
  formRowsToGrants,
  grantArrayFields,
  createGrantRowFormSchema,
  grantsToFormRows,
} from '../../lib/grant-form-helpers'
import { applyStableIdsForUpdate } from '../../lib/content-form-key-helpers'
import type { ContentFormCtx } from '../../lib/content-form-registry'

export function getLevelOptions(maxLevel: number = MAX_CHARACTER_LEVEL): FieldOption[] {
  return buildLevelOptions(maxLevel).map((option) => ({
    value: option.value,
    label: option.label.replace('Level ', ''),
  }))
}

export function createFeatureRowFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  const levelField = z.coerce.number().pipe(campaignLevelSchema(maxLevel))
  return z.object({
    id: z.string().min(1).optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    level: levelField,
    grants: z.array(createGrantRowFormSchema(maxLevel)),
  })
}

export const featureRowFormSchema = createFeatureRowFormSchema()

export type FeatureRowForm = z.infer<typeof featureRowFormSchema>

export function featureItemTitle(
  row: Pick<FeatureRowForm, 'name'> | undefined,
  index: number,
): string {
  return (typeof row?.name === 'string' && row.name.trim()) || `Feature ${index + 1}`
}

export function featureItemEyebrow(
  row: { level?: number | string } | undefined,
): string | undefined {
  const level = row?.level
  if (level === undefined || level === null || level === '') return undefined
  return `Level ${level}`
}

export function classFeatureItemFields(
  ctx: ContentFormCtx,
  options?: { defaultFeatureLevel?: number },
): FormItem[] {
  const maxLevel = ctx.campaignRules?.maxCharacterLevel ?? MAX_CHARACTER_LEVEL
  const levelOptions = getLevelOptions(maxLevel)

  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'select',
          name: 'level',
          label: 'Level',
          options: levelOptions,
          required: true,
          width: 'sm',
          ...(options?.defaultFeatureLevel !== undefined
            ? { defaultValue: String(options.defaultFeatureLevel) }
            : {}),
        },
        { type: 'text', name: 'name', label: 'Name', required: true },
      ],
    },
    { type: 'richtext', name: 'description', label: 'Description' },
    ...grantArrayFields(CLASS_GRANT_TYPES, CLASS_GRANT_TYPE_LABELS, ctx),
  ]
}

export function featureToFormRow(feature: ClassFeature): FeatureRowForm {
  return {
    id: feature.id,
    name: feature.name,
    description: feature.description,
    level: feature.level,
    grants: grantsToFormRows(feature.grants),
  }
}

export function featureFromFormRow(row: FeatureRowForm & { id: string }): ClassFeature {
  return {
    kind: 'custom',
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    level: row.level,
    grants: formRowsToGrants(row.grants),
  }
}

export function featuresFromFormValues(
  rows: FeatureRowForm[],
  existing?: readonly ClassFeature[],
): ClassFeature[] {
  return applyStableIdsForUpdate(rows, existing).map(featureFromFormRow)
}
