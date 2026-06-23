import { z } from 'zod'
import { levelSchema, MAX_CHARACTER_LEVEL, type ClassFeature } from '@rpg/contracts'
import { type FieldOption, type FormItem } from '@rpg/ui/form'

import {
  CLASS_GRANT_TYPES,
  CLASS_GRANT_TYPE_LABELS,
  formRowsToGrants,
  grantArrayFields,
  grantRowFormSchema,
  grantsToFormRows,
} from '../../lib/grant-form-helpers'
import { applyStableIdsForUpdate } from '../../lib/content-form-key-helpers'
import type { ContentFormCtx } from '../../lib/content-form-registry'

export const levelOptions: FieldOption[] = Array.from(
  { length: MAX_CHARACTER_LEVEL },
  (_, index) => {
    const level = index + 1
    return { value: String(level), label: String(level) }
  },
)

export const featureRowFormSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  level: z.coerce.number().pipe(levelSchema),
  grants: z.array(grantRowFormSchema),
})

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
