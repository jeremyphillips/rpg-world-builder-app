import { z } from 'zod'
import {
  CLASS_FEATURE_KINDS,
  campaignLevelSchema,
  MAX_CHARACTER_LEVEL,
  resolveGrantGroupsFromContent,
  type ClassFeature,
  type ClassFeatureKind,
} from '@rpg/contracts'
import { type FormItem } from '@rpg/ui/form'

import { grantArrayFields } from '../../lib/forms/grants/grant-form-fields'
import {
  appendGrantCountSummaryPart,
  formatCharacterLevelSummaryPart,
  joinFormArrayItemSummaryParts,
} from '../../../../lib/forms/array-item-summary'
import {
  GRANT_TYPES,
  GRANT_TYPE_LABELS,
  createGrantRowFormSchema,
} from '../../lib/forms/grants/grant-form-schema'
import {
  grantGroupsToFormRows,
  formRowsToGrantGroups,
} from '../../lib/forms/grants/grant-form-values'
import { applyStableIdsForUpdate } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'
import { getLevelFieldOptions, levelSelectDigits } from '../../lib/form-options/level-field-options'

export function createFeatureRowFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  const levelField = z.coerce.number().pipe(campaignLevelSchema(maxLevel))
  return z.object({
    id: z.string().min(1).optional(),
    kind: z.enum(CLASS_FEATURE_KINDS).optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    level: levelField,
    grants: z.array(createGrantRowFormSchema(maxLevel)),
  })
}

/** Draft feature row — name may be empty while authoring. */
export function createFeatureRowDraftFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  const levelField = z.coerce.number().pipe(campaignLevelSchema(maxLevel))
  return z.object({
    id: z.string().min(1).optional(),
    kind: z.enum(CLASS_FEATURE_KINDS).optional(),
    name: z.string(),
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
  return formatCharacterLevelSummaryPart(row?.level)
}

export function formatFeatureRowSummary(row: FeatureRowForm): string {
  const parts: string[] = []

  const levelPart = formatCharacterLevelSummaryPart(row.level)
  if (levelPart) parts.push(levelPart)

  appendGrantCountSummaryPart(parts, row.grants?.length ?? 0)

  return joinFormArrayItemSummaryParts(parts)
}

export function classFeatureItemFields(
  ctx: ContentFormCtx,
  options?: { defaultFeatureLevel?: number },
): FormItem[] {
  const levelOptions = getLevelFieldOptions(ctx)
  const levelDigits = levelSelectDigits(ctx)

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
          digits: levelDigits,
          width: 'auto',
          ...(options?.defaultFeatureLevel !== undefined
            ? { defaultValue: String(options.defaultFeatureLevel) }
            : {}),
        },
        { type: 'text', name: 'name', label: 'Name', required: true },
      ],
    },
    {
      type: 'richtext',
      name: 'description',
      label: 'Description',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
    },
    ...grantArrayFields(GRANT_TYPES, GRANT_TYPE_LABELS, ctx),
  ]
}

export function featureToFormRow(feature: ClassFeature): FeatureRowForm {
  const grants = grantGroupsToFormRows(
    resolveGrantGroupsFromContent(feature, { level: feature.level }),
  )
  return {
    id: feature.id,
    kind: feature.kind,
    name: feature.name,
    description: feature.description,
    level: feature.level,
    grants,
  }
}

const DEFAULT_CLASS_FEATURE_KIND = CLASS_FEATURE_KINDS[0] satisfies ClassFeatureKind

export function featureFromFormRow(row: FeatureRowForm & { id: string }): ClassFeature {
  const grantGroups = formRowsToGrantGroups(row.grants, { level: row.level })
  return {
    kind: row.kind ?? DEFAULT_CLASS_FEATURE_KIND,
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    level: row.level,
    ...(grantGroups.length ? { grantGroups } : {}),
  }
}

export function featuresFromFormValues(
  rows: FeatureRowForm[],
  existing?: readonly ClassFeature[],
): ClassFeature[] {
  return applyStableIdsForUpdate(rows, existing).map(featureFromFormRow)
}
export function maxLevelFromCtx(ctx: ContentFormCtx): number {
  return effectiveMaxFromCtx(ctx)
}
