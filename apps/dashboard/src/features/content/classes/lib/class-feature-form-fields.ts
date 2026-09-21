import { createElement } from 'react'
import { z } from 'zod'
import {
  CLASS_FEATURE_KINDS,
  campaignLevelSchema,
  classValidationMessages,
  MAX_CHARACTER_LEVEL,
  contentTableSchema,
  resolveGrantGroupsFromContent,
  type ClassBodyFeature,
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
  GRANT_DEFAULT_UNLOCK_LEVEL,
  createGrantRowFormSchema,
} from '../../lib/forms/grants/grant-form-schema'
import {
  grantGroupsToFormRows,
  formRowsToGrantGroups,
} from '../../lib/forms/grants/grant-form-values'
import { applyStableIdsForUpdate } from '../../lib/forms/registry/content-form-key-helpers'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { ClassFeatureManagedSpellcastingGrantField } from '../components/class-feature-managed-spellcasting-grant-field'
import { FeatureTablesField } from '../components/features/feature-tables-field'
import { isSpellcastingGrantingFeatureRow } from './class-spellcasting-lifecycle'
import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'
import { getLevelFieldOptions, levelSelectDigits } from '../../lib/form-options/level-field-options'

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
      ctx.addIssue({
        code: 'custom',
        message: classValidationMessages.grantGroupUnlockAfterFeatureLevel({
          unlockLevel: numericUnlock,
          featureLevel: row.level,
        }),
        path: ['grants', index, 'unlockLevel'],
      })
    }
  }
}

function createFeatureRowBaseFormSchema(maxLevel: number = MAX_CHARACTER_LEVEL) {
  const levelField = z.coerce.number().pipe(campaignLevelSchema(maxLevel))
  return z
    .object({
      id: z.string().min(1).optional(),
      kind: z.enum(CLASS_FEATURE_KINDS).optional(),
      name: z.string().min(1),
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
    kind: z.enum(CLASS_FEATURE_KINDS).optional(),
    name: z.string(),
    description: z.string().optional(),
    level: levelField,
    grants: z.array(createGrantRowFormSchema(maxLevel)),
    available: z.boolean().default(true),
    tables: z.array(contentTableSchema).default([]),
  })
}

export const featureRowFormSchema = createFeatureRowFormSchema()
export const subclassFeatureRowFormSchema = createSubclassFeatureRowFormSchema()

export type FeatureRowForm = z.infer<typeof featureRowFormSchema>
export type SubclassFeatureRowForm = z.infer<typeof subclassFeatureRowFormSchema>

export function featureItemTitle(row: Pick<FeatureRowForm, 'name'> | undefined): string {
  return typeof row?.name === 'string' ? row.name.trim() : ''
}

export function featureItemEyebrow(
  row: { level?: number | string } | undefined,
): string | undefined {
  return formatCharacterLevelSummaryPart(row?.level)
}

export function formatFeatureRowSummary(
  row: Pick<FeatureRowForm, 'name' | 'level' | 'grants'>,
): string {
  const parts: string[] = []

  const levelPart = formatCharacterLevelSummaryPart(row.level)
  if (levelPart) parts.push(levelPart)

  appendGrantCountSummaryPart(parts, row.grants?.length ?? 0)

  return joinFormArrayItemSummaryParts(parts)
}

function sharedFeatureItemFields(
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
    {
      kind: 'slot',
      name: 'managedSpellcastingGrant',
      visibility: {
        dependsOn: ['grants'],
        visibleWhen: (watched) =>
          isSpellcastingGrantingFeatureRow({
            grants: watched.grants as FeatureRowForm['grants'],
          }),
      },
      render: () => createElement(ClassFeatureManagedSpellcastingGrantField),
    },
    ...grantArrayFields(GRANT_TYPES, GRANT_TYPE_LABELS, ctx, {
      inheritUnlockFromParentField: 'level',
    }).map(
      (field): FormItem =>
        'kind' in field && field.kind === 'array'
          ? {
              ...field,
              visibility: {
                dependsOn: ['grants'],
                visibleWhen: (watched: Record<string, unknown>) =>
                  !isSpellcastingGrantingFeatureRow({
                    grants: watched.grants as FeatureRowForm['grants'],
                  }),
              },
            }
          : field,
    ),
  ]
}

/** Class and subclass feature rows share grants and prose; tables are class-only. */
export function subclassFeatureItemFields(
  ctx: ContentFormCtx,
  options?: { defaultFeatureLevel?: number },
): FormItem[] {
  return sharedFeatureItemFields(ctx, options)
}

export function classFeatureItemFields(
  ctx: ContentFormCtx,
  options?: { defaultFeatureLevel?: number },
): FormItem[] {
  return [
    ...sharedFeatureItemFields(ctx, options),
    {
      kind: 'slot',
      name: 'tables',
      visibility: {
        dependsOn: ['kind'],
        visibleWhen: (values) => values.kind !== 'subclass-choice',
      },
      render: () => createElement(FeatureTablesField, { formCtx: ctx }),
    },
  ]
}

export function featureToFormRow(feature: ClassFeature | ClassBodyFeature): FeatureRowForm {
  const grants = grantGroupsToFormRows(
    resolveGrantGroupsFromContent(feature, { level: feature.level }),
  )
  const available = 'available' in feature && feature.available === false ? false : true
  const tables = feature.kind === 'custom' && feature.tables?.length ? [...feature.tables] : []

  return {
    id: feature.id,
    kind: feature.kind,
    name: feature.name,
    description: feature.description,
    level: feature.level,
    grants,
    tables,
    available,
  }
}

const DEFAULT_CLASS_FEATURE_KIND = CLASS_FEATURE_KINDS[0] satisfies ClassFeatureKind

function subclassChoiceFeatureFromFormRow(
  row: FeatureRowForm & { id: string },
  grantGroups: ReturnType<typeof formRowsToGrantGroups>,
): ClassBodyFeature {
  return {
    kind: 'subclass-choice',
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    level: row.level,
    ...(grantGroups.length ? { grantGroups } : {}),
    ...(row.available === false ? { available: false } : {}),
  }
}

function customFeatureFromFormRow(
  row: FeatureRowForm & { id: string },
  grantGroups: ReturnType<typeof formRowsToGrantGroups>,
): ClassBodyFeature {
  const tables = row.tables?.length ? row.tables : undefined

  return {
    kind: 'custom',
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    level: row.level,
    ...(grantGroups.length ? { grantGroups } : {}),
    ...(tables ? { tables } : {}),
    ...(row.available === false ? { available: false } : {}),
  }
}

export function featureFromFormRow(row: FeatureRowForm & { id: string }): ClassBodyFeature {
  const grantGroups = formRowsToGrantGroups(row.grants, { level: row.level })
  const kind = row.kind ?? DEFAULT_CLASS_FEATURE_KIND

  return kind === 'subclass-choice'
    ? subclassChoiceFeatureFromFormRow(row, grantGroups)
    : customFeatureFromFormRow(row, grantGroups)
}

/** Subclass feature rows omit campaign availability — use for subclass form save. */
export function subclassFeatureFromFormRow(
  row: SubclassFeatureRowForm & { id: string },
): ClassFeature {
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

export function subclassFeaturesFromFormValues(
  rows: SubclassFeatureRowForm[],
  existing?: readonly ClassFeature[],
): ClassFeature[] {
  return applyStableIdsForUpdate(rows, existing).map(subclassFeatureFromFormRow)
}

export function featuresFromFormValues(
  rows: FeatureRowForm[],
  existing?: readonly ClassBodyFeature[],
): ClassBodyFeature[] {
  return applyStableIdsForUpdate(rows, existing).map((row) => featureFromFormRow(row))
}
export function maxLevelFromCtx(ctx: ContentFormCtx): number {
  return effectiveMaxFromCtx(ctx)
}
