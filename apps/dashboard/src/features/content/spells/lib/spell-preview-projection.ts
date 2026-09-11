import {
  SPELL_CONTENT_TYPE_TERM,
  formatAreaGeometry,
  formatSlugAsLabel,
  getEffectConditionLabel,
  getSpellDeliveryMethodLabel,
  getSpellFunctionTagLabel,
  getSpellRoleTagLabel,
  getSpellSchoolLabel,
  effectiveSpellModelingStatus,
  spellDeliveryMethodSchema,
  type Spell,
} from '@rpg/contracts'
import { formatPreviewRailOverflowList, type PreviewRailFact } from '@rpg/ui'

import {
  getDamageTypeLabelFromVocabulary,
  getSpellSchoolLabelFromVocabulary,
} from '@/features/vocabulary'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER,
  CONTENT_PREVIEW_NOT_SET,
  CONTENT_PREVIEW_STATUS_NONE,
  CONTENT_PREVIEW_STATUS_OFF,
  CONTENT_PREVIEW_STATUS_READY,
  contentPreviewUnnamedName,
} from '../../lib/forms/preview/content-form-preview-copy'
import type {
  ContentPreviewIdentity,
  ContentPreviewSection,
} from '../../lib/forms/preview/content-form-preview.types'
import { isResolutionFormConfigured } from '../resolution/lib/form/resolution-form-visibility'
import { resolutionToStored } from '../resolution/lib/form/resolution-form-values'
import type { ResolutionFormValues } from '../resolution/lib/form/resolution-form-schema'
import {
  formatCastingTime,
  formatSpellComponents,
  formatSpellDuration,
  formatSpellLevelLabel,
  formatSpellRange,
  spellRequiresConcentration,
} from './format-spell-metadata'
import type { SpellFormValues } from './spell-form-fields'
import {
  buildSpellDetailViewModel,
  getModelingStatusLabel,
  SPELL_SECTION_LABELS,
  SPELL_STAT_LABELS,
  type SpellDetailViewModel,
  type SpellDisplayVocabulary,
} from './spell-display'
import {
  spellAreaOfEffectFromFormValues,
  spellCastingTimeFromFormValues,
  spellComponentsFromFormValues,
  spellCreateDefaultValues,
  spellDurationFromFormValues,
  spellRangeFromFormValues,
  spellTagsFromFormValues,
  type SpellFormAreaOfEffect,
  type SpellFormCastingTime,
  type SpellFormComponents,
  type SpellFormDuration,
  type SpellFormRange,
  type SpellFormTags,
} from './spell-form-values'
import { SPELL_DELIVERY_METHOD_NONE } from './spell-form-labels'

const PREVIEW_SPELL_ENVELOPE = {
  rulesetId: 'srd-cc-5.2.1' as const,
  campaignId: null,
  createdAt: '',
  updatedAt: '',
}

export const SPELL_PREVIEW_FACT_LABELS = {
  level: SPELL_STAT_LABELS.level,
  school: SPELL_STAT_LABELS.school,
  classes: SPELL_SECTION_LABELS.classes,
  castingTime: SPELL_STAT_LABELS.castingTime,
  range: SPELL_STAT_LABELS.range,
  area: SPELL_STAT_LABELS.area,
  duration: SPELL_STAT_LABELS.duration,
  components: SPELL_STAT_LABELS.components,
  ritual: SPELL_STAT_LABELS.ritual,
  concentration: SPELL_STAT_LABELS.concentration,
  delivery: SPELL_STAT_LABELS.delivery,
  tags: 'Tags',
  modelingStatus: 'Modeling status',
} as const

function htmlToPreviewSnippet(html: string | undefined): string | undefined {
  if (!html) return undefined
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text || undefined
}

function spellPreviewName(values: SpellFormValues): string {
  const trimmed = values.name?.trim()
  return trimmed ? trimmed : contentPreviewUnnamedName(SPELL_CONTENT_TYPE_TERM)
}

function formatClassLabel(classId: string, ctx: ContentFormCtx): string {
  const match = ctx.options?.classes?.visible.find(
    (cls) => cls.id === classId || cls.slug === classId,
  )
  return match?.name ?? formatSlugAsLabel(classId)
}

function resolveSchoolLabel(schoolId: string | undefined, ctx: ContentFormCtx): string {
  if (!schoolId) return CONTENT_PREVIEW_NOT_SET
  if (ctx.spellSchoolVocabulary) {
    return getSpellSchoolLabelFromVocabulary(ctx.spellSchoolVocabulary, schoolId)
  }
  return getSpellSchoolLabel(schoolId)
}

function collectTagLabels(tags: SpellFormTags | undefined, ctx: ContentFormCtx): string[] {
  if (!tags) return []
  const labels: string[] = []
  tags.roles?.forEach((role) => labels.push(getSpellRoleTagLabel(role)))
  tags.functions?.forEach((fn) => labels.push(getSpellFunctionTagLabel(fn)))
  tags.damageTypes?.forEach((type) =>
    labels.push(
      ctx.damageTypeVocabulary
        ? getDamageTypeLabelFromVocabulary(ctx.damageTypeVocabulary, type)
        : formatSlugAsLabel(type),
    ),
  )
  tags.conditions?.forEach((condition) => labels.push(getEffectConditionLabel(condition)))
  return labels
}

function spellPreviewVocabulary(ctx: ContentFormCtx): SpellDisplayVocabulary {
  return {
    resolveSpellSchoolLabel: (schoolId) => resolveSchoolLabel(schoolId, ctx),
    resolveDamageTypeLabel: (typeId) =>
      ctx.damageTypeVocabulary
        ? getDamageTypeLabelFromVocabulary(ctx.damageTypeVocabulary, typeId)
        : formatSlugAsLabel(typeId),
    resolveClassLabel: (slug) => formatClassLabel(slug, ctx),
  }
}

function mergedCastingTime(values: SpellFormValues): SpellFormCastingTime {
  return values.castingTime ?? spellCreateDefaultValues.castingTime!
}

function mergedRange(values: SpellFormValues): SpellFormRange {
  return values.range ?? spellCreateDefaultValues.range!
}

function mergedDuration(values: SpellFormValues): SpellFormDuration {
  return values.duration ?? spellCreateDefaultValues.duration!
}

function mergedComponents(values: SpellFormValues): SpellFormComponents {
  return values.components ?? spellCreateDefaultValues.components!
}

function mergedArea(values: SpellFormValues): SpellFormAreaOfEffect | undefined {
  return values.areaOfEffect ?? spellCreateDefaultValues.areaOfEffect
}

function spellDeliveryMethodFromFormValues(deliveryMethod: string | undefined) {
  const rawDelivery = deliveryMethod?.trim()
  if (!rawDelivery || rawDelivery === SPELL_DELIVERY_METHOD_NONE) return undefined
  const parsed = spellDeliveryMethodSchema.safeParse(rawDelivery)
  return parsed.success ? parsed.data : undefined
}

export function buildSpellPreviewIdentity(
  values: SpellFormValues,
  _ctx: ContentFormCtx,
): ContentPreviewIdentity {
  return {
    name: spellPreviewName(values),
  }
}

function buildBasicsSection(values: SpellFormValues, ctx: ContentFormCtx): ContentPreviewSection {
  const classLabels = (values.classIds ?? []).map((id) => formatClassLabel(id, ctx))
  const facts: PreviewRailFact[] = [
    {
      label: SPELL_PREVIEW_FACT_LABELS.level,
      value:
        values.level !== undefined ? formatSpellLevelLabel(values.level) : CONTENT_PREVIEW_NOT_SET,
    },
    {
      label: SPELL_PREVIEW_FACT_LABELS.school,
      value: resolveSchoolLabel(values.school, ctx),
    },
    {
      label: SPELL_PREVIEW_FACT_LABELS.classes,
      value:
        classLabels.length > 0
          ? formatPreviewRailOverflowList(classLabels)
          : CONTENT_PREVIEW_NOT_SET,
    },
  ]

  return {
    derivedKind: 'ready',
    status: CONTENT_PREVIEW_STATUS_READY,
    description:
      htmlToPreviewSnippet(values.description) ?? CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER,
    facts,
  }
}

function buildCastingSection(values: SpellFormValues): ContentPreviewSection {
  const castingTime = spellCastingTimeFromFormValues(mergedCastingTime(values))
  const range = spellRangeFromFormValues(mergedRange(values))
  const duration = spellDurationFromFormValues(mergedDuration(values))
  const components = spellComponentsFromFormValues(mergedComponents(values))
  const areaOfEffect = spellAreaOfEffectFromFormValues(mergedArea(values))
  const deliveryMethod = spellDeliveryMethodFromFormValues(values.deliveryMethod)

  const facts: PreviewRailFact[] = [
    {
      label: SPELL_PREVIEW_FACT_LABELS.castingTime,
      value: formatCastingTime(castingTime),
    },
    { label: SPELL_PREVIEW_FACT_LABELS.range, value: formatSpellRange(range) },
    { label: SPELL_PREVIEW_FACT_LABELS.duration, value: formatSpellDuration(duration) },
    { label: SPELL_PREVIEW_FACT_LABELS.components, value: formatSpellComponents(components) },
    {
      label: SPELL_PREVIEW_FACT_LABELS.ritual,
      value: castingTime.canBeCastAsRitual ? 'Yes' : 'No',
    },
    {
      label: SPELL_PREVIEW_FACT_LABELS.concentration,
      value: spellRequiresConcentration(duration) ? 'Yes' : 'No',
    },
  ]

  if (areaOfEffect) {
    facts.push({
      label: SPELL_PREVIEW_FACT_LABELS.area,
      value: formatAreaGeometry(areaOfEffect),
    })
  }

  if (deliveryMethod) {
    facts.push({
      label: SPELL_PREVIEW_FACT_LABELS.delivery,
      value: getSpellDeliveryMethodLabel(deliveryMethod),
    })
  }

  return {
    derivedKind: 'ready',
    status: CONTENT_PREVIEW_STATUS_READY,
    facts,
  }
}

function buildResolutionSection(values: SpellFormValues): ContentPreviewSection {
  if (!isResolutionFormConfigured(values as Record<string, unknown>)) {
    return {
      derivedKind: 'off',
      status: CONTENT_PREVIEW_STATUS_OFF,
    }
  }

  const spell = spellDetailSourceFromFormValues(values)
  const status = effectiveSpellModelingStatus(spell)

  return {
    derivedKind: 'ready',
    status: getModelingStatusLabel(status),
    facts: [
      { label: SPELL_PREVIEW_FACT_LABELS.modelingStatus, value: getModelingStatusLabel(status) },
    ],
  }
}

function buildTagsSection(values: SpellFormValues, ctx: ContentFormCtx): ContentPreviewSection {
  const labels = collectTagLabels(values.tags, ctx)
  if (labels.length === 0) {
    return {
      derivedKind: 'none',
      status: CONTENT_PREVIEW_STATUS_NONE,
    }
  }

  return {
    derivedKind: 'count',
    status: String(labels.length),
    facts: [
      {
        label: SPELL_PREVIEW_FACT_LABELS.tags,
        value: formatPreviewRailOverflowList(labels),
      },
    ],
  }
}

export function buildSpellPreviewSections(
  values: SpellFormValues,
  ctx: ContentFormCtx,
): Record<string, ContentPreviewSection | null> {
  return {
    basics: buildBasicsSection(values, ctx),
    casting: buildCastingSection(values),
    resolution: buildResolutionSection(values),
    tags: buildTagsSection(values, ctx),
  }
}

export function spellDetailSourceFromFormValues(values: SpellFormValues): Spell {
  const castingTime = spellCastingTimeFromFormValues(mergedCastingTime(values))
  const range = spellRangeFromFormValues(mergedRange(values))
  const duration = spellDurationFromFormValues(mergedDuration(values))
  const components = spellComponentsFromFormValues(mergedComponents(values))
  const tags = spellTagsFromFormValues(values.tags)
  const areaOfEffect = spellAreaOfEffectFromFormValues(mergedArea(values))
  const deliveryMethod = spellDeliveryMethodFromFormValues(values.deliveryMethod)
  const resolutionConfigured = isResolutionFormConfigured(values as Record<string, unknown>)
  const resolution = resolutionConfigured
    ? resolutionToStored(values.resolution as ResolutionFormValues | undefined)
    : undefined

  return {
    ...PREVIEW_SPELL_ENVELOPE,
    id: 'preview',
    name: spellPreviewName(values),
    slug: values.slug ?? 'preview',
    source: 'homebrew',
    status: 'draft',
    school: values.school ?? '',
    level: values.level ?? 0,
    classIds: values.classIds ?? [],
    description: values.description,
    cantripScaling: values.cantripScaling,
    higherLevelSlotEffect: values.higherLevelSlotEffect,
    castingTime,
    range,
    duration,
    components,
    ...(tags ? { tags } : {}),
    ...(areaOfEffect ? { areaOfEffect } : {}),
    ...(deliveryMethod ? { deliveryMethod } : {}),
    ...(resolution ? { resolution } : {}),
  }
}

export function buildSpellPreviewDetailViewModel(
  values: SpellFormValues,
  ctx: ContentFormCtx,
): SpellDetailViewModel {
  return buildSpellDetailViewModel(
    spellDetailSourceFromFormValues(values),
    spellPreviewVocabulary(ctx),
  )
}
