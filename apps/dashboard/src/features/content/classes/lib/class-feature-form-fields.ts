import { createElement } from 'react'
import { z } from 'zod'
import type { ArrayResolveFieldsFn } from '@rpg/ui/form'
import {
  CLASS_FEATURE_KINDS,
  MAX_CHARACTER_LEVEL,
  addCustomRefinementIssue,
  campaignLevelSchema,
  classValidationMessages,
  contentTableSchema,
  resolveGrantGroupsFromContent,
  subclassChoiceFeatureLabel,
  type ClassBodyFeature,
  type ClassFeature,
  type ClassFeatureKind,
} from '@rpg/contracts'
import { normalizeRichTextHtml } from '@rpg/ui'
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
import type { MasterDetailItemFieldSections } from '../../components/master-detail/master-detail-detail-body'
import { FeatureTablesField } from '../components/features/feature-tables-field'
import { isSpellcastingFeatureRow } from './class-feature-authoring'
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
      kind: z.enum(CLASS_FEATURE_KINDS).optional(),
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

export function featureItemTitle(
  row: Pick<FeatureRowForm, 'name' | 'kind'> | undefined,
  className?: string,
): string {
  if (!row) return ''
  const name = typeof row.name === 'string' ? row.name.trim() : ''
  if (row.kind === 'subclass-choice' && className) {
    const derived = subclassChoiceFeatureLabel(className)
    return name || derived
  }
  return name
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

type FeatureFieldOptions = { defaultFeatureLevel?: number }

function featureLevelSelectField(
  ctx: ContentFormCtx,
  options?: FeatureFieldOptions,
): Extract<FormItem, { type: 'select' }> {
  const levelOptions = getLevelFieldOptions(ctx)
  const levelDigits = levelSelectDigits(ctx)
  return {
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
  }
}

function featureLevelRow(ctx: ContentFormCtx, options?: FeatureFieldOptions): FormItem {
  return {
    kind: 'row',
    fields: [featureLevelSelectField(ctx, options)],
  }
}

function featureLevelAndNameRow(ctx: ContentFormCtx, options?: FeatureFieldOptions): FormItem {
  return {
    kind: 'row',
    fields: [
      featureLevelSelectField(ctx, options),
      { type: 'text', name: 'name', label: 'Name', required: true },
    ],
  }
}

function customFeatureGrantFields(ctx: ContentFormCtx): FormItem[] {
  return grantArrayFields(GRANT_TYPES, GRANT_TYPE_LABELS, ctx, {
    inheritUnlockFromParentField: 'level',
  })
}

function classFeatureCustomFieldSections(
  ctx: ContentFormCtx,
  options?: FeatureFieldOptions,
): MasterDetailItemFieldSections {
  return {
    leading: [featureLevelRow(ctx, options)],
    primary: [
      {
        type: 'richtext',
        name: 'description',
        label: 'Description',
        linkable: true,
        internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
        contentTypeOptions: ctx.options?.richTextContentTypeOptions,
      },
      ...customFeatureGrantFields(ctx),
      {
        kind: 'slot',
        name: 'tables',
        render: () => createElement(FeatureTablesField, { formCtx: ctx }),
      },
    ],
  }
}

function classFeatureAsiFieldSections(
  ctx: ContentFormCtx,
  options?: FeatureFieldOptions,
): MasterDetailItemFieldSections {
  return {
    leading: [featureLevelRow(ctx, options)],
    primary: [
      {
        type: 'richtext',
        name: 'description',
        label: 'Description',
        linkable: true,
        internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
        contentTypeOptions: ctx.options?.richTextContentTypeOptions,
      },
    ],
  }
}

function classFeatureSpellcastingFieldSections(
  ctx: ContentFormCtx,
  options?: FeatureFieldOptions,
): MasterDetailItemFieldSections {
  return {
    leading: [featureLevelRow(ctx, options)],
    primary: [
      {
        type: 'richtext',
        name: 'intro',
        label: 'Introduction',
        hint: 'Optional introductory text shown before the generated rules.',
        linkable: true,
        internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
        contentTypeOptions: ctx.options?.richTextContentTypeOptions,
      },
    ],
  }
}

function classFeatureSubclassChoiceFieldSections(
  ctx: ContentFormCtx,
  options?: FeatureFieldOptions,
): MasterDetailItemFieldSections {
  return {
    leading: [featureLevelRow(ctx, options)],
    primary: [],
  }
}

const CLASS_FEATURE_KIND_FIELD_SECTIONS = {
  custom: classFeatureCustomFieldSections,
  asi: classFeatureAsiFieldSections,
  spellcasting: classFeatureSpellcastingFieldSections,
  'subclass-choice': classFeatureSubclassChoiceFieldSections,
} as const satisfies Record<
  ClassFeatureKind,
  (ctx: ContentFormCtx, options?: FeatureFieldOptions) => MasterDetailItemFieldSections
>

function assertClassFeatureKind(
  row: Pick<FeatureRowForm, 'kind'> | undefined,
): asserts row is Pick<FeatureRowForm, 'kind'> & { kind: ClassFeatureKind } {
  if (!row?.kind) {
    throw new Error('Class feature row is missing kind')
  }
}

export function resolveClassFeatureFieldSections(
  row: Pick<FeatureRowForm, 'kind'> | undefined,
  ctx: ContentFormCtx,
  options?: FeatureFieldOptions,
): MasterDetailItemFieldSections {
  assertClassFeatureKind(row)
  return CLASS_FEATURE_KIND_FIELD_SECTIONS[row.kind](ctx, options)
}

export function resolveClassFeatureItemFields(
  row: Pick<FeatureRowForm, 'kind'> | undefined,
  ctx: ContentFormCtx,
  options?: FeatureFieldOptions,
): FormItem[] {
  const { leading, primary } = resolveClassFeatureFieldSections(row, ctx, options)
  return [...(leading ?? []), ...primary]
}

export function classFeatureRowResolveFields(
  ctx: ContentFormCtx,
  options?: FeatureFieldOptions,
): ArrayResolveFieldsFn {
  return (row) => resolveClassFeatureItemFields(row as FeatureRowForm | undefined, ctx, options)
}

/** Subclass collapsible arrays keep `name` on the item header via `primaryField`. */
export function subclassFeatureItemFields(
  ctx: ContentFormCtx,
  options?: FeatureFieldOptions,
): FormItem[] {
  return [
    featureLevelAndNameRow(ctx, options),
    {
      type: 'richtext',
      name: 'description',
      label: 'Description',
      linkable: true,
      internalLinkOptions: ctx.options?.richTextInternalLinkOptions,
      contentTypeOptions: ctx.options?.richTextContentTypeOptions,
    },
    ...customFeatureGrantFields(ctx),
  ]
}

/** Default field list for validation wiring and empty-row templates. */
export function classFeatureItemFields(
  ctx: ContentFormCtx,
  options?: FeatureFieldOptions,
): FormItem[] {
  return resolveClassFeatureItemFields({ kind: 'custom' }, ctx, options)
}

function optionalRichTextField(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  const normalized = normalizeRichTextHtml(value)
  return normalized || undefined
}

export function featureToFormRow(feature: ClassFeature | ClassBodyFeature): FeatureRowForm {
  const grants =
    feature.kind === 'custom'
      ? grantGroupsToFormRows(resolveGrantGroupsFromContent(feature, { level: feature.level }))
      : []
  const available = 'available' in feature && feature.available === false ? false : true
  const tables = feature.kind === 'custom' && feature.tables?.length ? [...feature.tables] : []

  return {
    id: feature.id,
    kind: feature.kind,
    name: 'name' in feature ? feature.name : '',
    intro: feature.kind === 'spellcasting' ? feature.intro : undefined,
    description:
      feature.kind === 'custom' || feature.kind === 'asi' ? feature.description : undefined,
    level: feature.level,
    grants,
    tables,
    available,
  }
}

const DEFAULT_CLASS_FEATURE_KIND = CLASS_FEATURE_KINDS[0] satisfies ClassFeatureKind

function subclassChoiceFeatureFromFormRow(
  row: FeatureRowForm & { id: string },
  options?: { className?: string },
): ClassBodyFeature {
  const trimmedName = row.name?.trim()
  const derived =
    options?.className !== undefined ? subclassChoiceFeatureLabel(options.className) : undefined
  const name =
    trimmedName && derived && trimmedName === derived ? undefined : trimmedName || undefined

  return {
    kind: 'subclass-choice',
    id: row.id,
    ...(name ? { name } : {}),
    level: row.level,
    ...(row.available === false ? { available: false } : {}),
  }
}

function asiFeatureFromFormRow(row: FeatureRowForm & { id: string }): ClassBodyFeature {
  return {
    kind: 'asi',
    id: row.id,
    name: row.name,
    description: row.description || undefined,
    level: row.level,
    ...(row.available === false ? { available: false } : {}),
  }
}

function spellcastingFeatureFromFormRow(row: FeatureRowForm & { id: string }): ClassBodyFeature {
  return {
    kind: 'spellcasting',
    id: row.id,
    name: row.name,
    intro: optionalRichTextField(row.intro),
    level: row.level,
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
    ...(row.description ? { description: row.description } : {}),
    level: row.level,
    ...(grantGroups.length ? { grantGroups } : {}),
    ...(tables ? { tables } : {}),
    ...(row.available === false ? { available: false } : {}),
  }
}

export function featureFromFormRow(
  row: FeatureRowForm & { id: string },
  options?: { className?: string },
): ClassBodyFeature {
  if (!row.kind) {
    throw new Error('Class feature row is missing kind')
  }
  const grantGroups = formRowsToGrantGroups(row.grants, { level: row.level })
  const kind = row.kind

  switch (kind) {
    case 'subclass-choice':
      return subclassChoiceFeatureFromFormRow(row, options)
    case 'asi':
      return asiFeatureFromFormRow(row)
    case 'spellcasting':
      return spellcastingFeatureFromFormRow(row)
    case 'custom':
    default:
      return customFeatureFromFormRow(row, grantGroups)
  }
}

/** Subclass feature rows omit campaign availability — use for subclass form save. */
export function subclassFeatureFromFormRow(
  row: SubclassFeatureRowForm & { id: string },
): ClassFeature {
  const grantGroups = formRowsToGrantGroups(row.grants, { level: row.level })
  return {
    kind: 'custom',
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
  options?: { className?: string },
): ClassBodyFeature[] {
  return applyStableIdsForUpdate(rows, existing).map((row) => featureFromFormRow(row, options))
}
export function maxLevelFromCtx(ctx: ContentFormCtx): number {
  return effectiveMaxFromCtx(ctx)
}
