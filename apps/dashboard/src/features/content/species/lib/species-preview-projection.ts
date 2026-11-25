import {
  DEFAULT_SYSTEM_RULESET_ID,
  SPECIES_CLASS_POLICY_MODES_REQUIRING_IDS,
  SPECIES_CONTENT_TYPE_TERM,
  getSpeciesHeritageLabel,
  createSpellCatalogContext,
  createEquipmentCatalogContext,
  type ContentMedia,
  type Species,
  type SystemRulesetId,
} from '@rpg/contracts'
import { formatPreviewRailOverflowList, type PreviewRailFact } from '@rpg/ui'

import { findVocabularyLabel } from '@/features/vocabulary'

import { equipmentReferenceScopeFromContentFormCtx } from '@/lib/content-form-equipment-reference-scope.lib'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER,
  CONTENT_PREVIEW_NOT_SET,
  CONTENT_PREVIEW_STATUS_NONE,
  CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
  CONTENT_PREVIEW_STATUS_OFF,
  CONTENT_PREVIEW_STATUS_READY,
  contentPreviewUnnamedName,
} from '../../lib/forms/preview/content-form-preview-copy'
import type {
  ContentPreviewIdentity,
  ContentPreviewSection,
} from '../../lib/forms/preview/content-form-preview.types'
import { resolveFormPreviewDisplayImage } from '../../lib/forms/preview/resolve-form-preview-display-image'
import { getCreatureTypeLabel } from './creature-type-field-options'
import { heritageFromFormValues } from './species-heritage-form-values'
import type { SpeciesFormValues } from './species-form-fields'
import {
  SPECIES_STAT_LABELS,
  buildSpeciesDetailViewModel,
  type SpeciesDetailViewModel,
  type SpeciesDisplayVocabulary,
} from './species-display'
import { movementRowsToRecordForPreview } from './species-movement-form-fields'
import {
  SPECIES_CLASS_POLICY_MODE_LABELS,
  SPECIES_MULTICLASS_POLICY_LABELS,
} from './species-rules-form-labels'
import {
  mergeLevelLimitsFormDefaults,
  mergeMulticlassingFormDefaults,
  resolveSpeciesClassLabel,
} from './species-rules-form-values'
import { traitRowNameForIdAssignment, traitsFromFormValues } from './species-trait-form-values'
import { speciesCreateDefaultValues } from './species-form-values'

const PREVIEW_SPECIES_ENVELOPE = {
  rulesetId: DEFAULT_SYSTEM_RULESET_ID as SystemRulesetId,
  campaignId: null,
  createdAt: '',
  updatedAt: '',
}

export const SPECIES_PREVIEW_FACT_LABELS = {
  creatureType: SPECIES_STAT_LABELS.creatureType,
  size: SPECIES_STAT_LABELS.size,
  movement: SPECIES_STAT_LABELS.movement,
  senses: SPECIES_STAT_LABELS.senses,
  languageAffinities: SPECIES_STAT_LABELS.languageAffinities,
  traits: 'Traits',
  heritage: getSpeciesHeritageLabel(),
  heritageOptions: 'Options',
  multiclassPolicy: 'Multiclass policy',
  classPolicyMode: 'Class policy',
  classPolicyClasses: 'Classes',
  maxCharacterLevel: 'Max character level',
  classLevelCaps: 'Class level caps',
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

function speciesPreviewName(values: SpeciesFormValues): string {
  const trimmed = values.name?.trim()
  return trimmed ? trimmed : contentPreviewUnnamedName(SPECIES_CONTENT_TYPE_TERM)
}

function speciesPreviewVocabulary(ctx: ContentFormCtx): SpeciesDisplayVocabulary {
  const scope = equipmentReferenceScopeFromContentFormCtx(ctx)
  const equipmentScope = scope ?? { rulesetId: '', campaignId: '' }
  return {
    equipmentReferences: {
      scope: equipmentScope,
      catalog: createEquipmentCatalogContext({
        status: scope ? (ctx.equipmentCatalogStatus ?? 'pending') : 'pending',
        scope: equipmentScope,
        equipmentById: ctx.equipmentCatalogById,
      }),
    },
    resolveSkillName: (slug) => ctx.skillCatalogBySlug?.get(slug)?.name,
    resolveCreatureTypeLabel: (id) => getCreatureTypeLabel(id, ctx),
    resolveDamageTypeLabel: (id) => findVocabularyLabel(ctx.damageTypeVocabulary, id),
    resolveLanguageLabel: (id) => findVocabularyLabel(ctx.languageVocabulary, id),
    resolveSenseLabel: (type) => findVocabularyLabel(ctx.senseVocabulary, type),
    spellCatalog: createSpellCatalogContext({
      status: ctx.spellCatalogStatus ?? 'pending',
      spellsById: ctx.spellCatalogById,
    }),
  }
}

function traitPreviewNames(values: SpeciesFormValues): string[] {
  return (values.traits ?? []).map((row, index) => traitRowNameForIdAssignment(row, index))
}

function hasHeritage(values: SpeciesFormValues): boolean {
  const heritage = values.heritage
  return heritage != null && typeof heritage === 'object'
}

function isRulesConfigured(values: SpeciesFormValues): boolean {
  return values.characterCreation != null
}

export function buildSpeciesPreviewIdentity(
  values: SpeciesFormValues,
  ctx: ContentFormCtx,
): ContentPreviewIdentity {
  const displayImage = resolveFormPreviewDisplayImage({
    media: (values as SpeciesFormValues & { media?: ContentMedia }).media,
    ctx,
    contentType: 'species',
    slug: ctx.entitySlug ?? values.slug ?? 'preview',
  })

  return {
    name: speciesPreviewName(values),
    ...(displayImage ? { displayImage } : {}),
  }
}

function buildBasicsSection(values: SpeciesFormValues, ctx: ContentFormCtx): ContentPreviewSection {
  const vocabulary = speciesPreviewVocabulary(ctx)
  const traits = traitsFromFormValues(values.traits ?? [])
  const speciesLike: Pick<
    Species,
    'creatureType' | 'sizes' | 'movement' | 'languageAffinities' | 'traits'
  > = {
    creatureType: values.creatureType,
    sizes: values.sizes,
    movement: movementRowsToRecordForPreview(values.movement),
    languageAffinities: values.languageAffinities,
    traits,
  }
  const statRows = buildSpeciesDetailViewModel(
    {
      ...PREVIEW_SPECIES_ENVELOPE,
      id: 'preview',
      name: speciesPreviewName(values),
      slug: 'preview',
      catalogLayer: 'homebrew',
      status: 'draft',
      ...speciesLike,
    },
    vocabulary,
  ).statRows

  return {
    derivedKind: 'ready',
    status: CONTENT_PREVIEW_STATUS_READY,
    description:
      htmlToPreviewSnippet(values.description) ?? CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER,
    facts: statRows.map((row) => ({ label: row.label, value: row.value })),
  }
}

function buildTraitsSection(values: SpeciesFormValues): ContentPreviewSection {
  const traits = values.traits ?? []
  if (traits.length === 0) {
    return {
      derivedKind: 'none',
      status: CONTENT_PREVIEW_STATUS_NONE,
    }
  }

  const names = traitPreviewNames(values)
  return {
    derivedKind: 'count',
    status: String(traits.length),
    facts: [
      {
        label: SPECIES_PREVIEW_FACT_LABELS.traits,
        value: formatPreviewRailOverflowList(names),
      },
    ],
  }
}

function buildHeritageSection(values: SpeciesFormValues): ContentPreviewSection {
  if (!hasHeritage(values)) {
    return {
      derivedKind: 'off',
      status: CONTENT_PREVIEW_STATUS_OFF,
    }
  }

  const heritage = values.heritage!
  const optionCount = heritage.options?.length ?? 0
  const heritageName = heritage.name?.trim() || 'Unnamed heritage'

  return {
    derivedKind: 'ready',
    status: heritageName,
    facts: [
      {
        label: SPECIES_PREVIEW_FACT_LABELS.heritageOptions,
        value:
          optionCount > 0
            ? `${optionCount} ${optionCount === 1 ? 'option' : 'options'}`
            : CONTENT_PREVIEW_NOT_SET,
      },
    ],
  }
}

function buildRulesFacts(values: SpeciesFormValues, ctx: ContentFormCtx): PreviewRailFact[] {
  const facts: PreviewRailFact[] = []
  const characterCreation = values.characterCreation
  if (!characterCreation) return facts

  const multiclassing = mergeMulticlassingFormDefaults(characterCreation.multiclassing)
  facts.push({
    label: SPECIES_PREVIEW_FACT_LABELS.multiclassPolicy,
    value: SPECIES_MULTICLASS_POLICY_LABELS[multiclassing.policy],
  })

  const classPolicy = multiclassing.classPolicy
  facts.push({
    label: SPECIES_PREVIEW_FACT_LABELS.classPolicyMode,
    value: SPECIES_CLASS_POLICY_MODE_LABELS[classPolicy.mode],
  })

  if (SPECIES_CLASS_POLICY_MODES_REQUIRING_IDS.includes(classPolicy.mode)) {
    const classLabels = (classPolicy.classIds ?? []).map((id) => resolveSpeciesClassLabel(id, ctx))
    facts.push({
      label: SPECIES_PREVIEW_FACT_LABELS.classPolicyClasses,
      value:
        classLabels.length > 0
          ? formatPreviewRailOverflowList(classLabels)
          : CONTENT_PREVIEW_NOT_SET,
    })
  }

  const levelLimits = mergeLevelLimitsFormDefaults(characterCreation.levelLimits)
  if (levelLimits.limitMaxCharacterLevel) {
    facts.push({
      label: SPECIES_PREVIEW_FACT_LABELS.maxCharacterLevel,
      value:
        levelLimits.maxCharacterLevel != null
          ? String(levelLimits.maxCharacterLevel)
          : CONTENT_PREVIEW_NOT_SET,
    })
  }

  if (levelLimits.enableClassLevelCaps) {
    const capCount = levelLimits.classLevelCaps.length
    facts.push({
      label: SPECIES_PREVIEW_FACT_LABELS.classLevelCaps,
      value: capCount > 0 ? String(capCount) : CONTENT_PREVIEW_NOT_SET,
    })
  }

  return facts
}

function buildRulesSection(values: SpeciesFormValues, ctx: ContentFormCtx): ContentPreviewSection {
  const configured = isRulesConfigured(values)

  return {
    derivedKind: configured ? 'ready' : 'notConfigured',
    status: configured ? CONTENT_PREVIEW_STATUS_READY : CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
    ...(configured ? { facts: buildRulesFacts(values, ctx) } : {}),
  }
}

export function buildSpeciesPreviewSections(
  values: SpeciesFormValues,
  ctx: ContentFormCtx,
): Record<string, ContentPreviewSection | null> {
  return {
    basics: buildBasicsSection(values, ctx),
    traits: buildTraitsSection(values),
    heritage: buildHeritageSection(values),
    rules: buildRulesSection(values, ctx),
  }
}

export function speciesDetailSourceFromFormValues(values: SpeciesFormValues): Species {
  return {
    ...PREVIEW_SPECIES_ENVELOPE,
    id: 'preview',
    name: speciesPreviewName(values),
    slug: values.slug ?? 'preview',
    catalogLayer: 'homebrew',
    status: 'draft',
    description: values.description,
    creatureType: values.creatureType ?? speciesCreateDefaultValues.creatureType!,
    sizes: values.sizes ?? speciesCreateDefaultValues.sizes!,
    movement: movementRowsToRecordForPreview(
      values.movement ?? speciesCreateDefaultValues.movement!,
    ),
    languageAffinities: values.languageAffinities,
    traits: traitsFromFormValues(values.traits ?? []),
    heritage: heritageFromFormValues(values.heritage),
  }
}

export function buildSpeciesPreviewDetailViewModel(
  values: SpeciesFormValues,
  ctx: ContentFormCtx,
): SpeciesDetailViewModel {
  return buildSpeciesDetailViewModel(
    speciesDetailSourceFromFormValues(values),
    speciesPreviewVocabulary(ctx),
  )
}
