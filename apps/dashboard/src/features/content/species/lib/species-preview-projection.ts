import {
  SPECIES_CLASS_POLICY_MODES_REQUIRING_IDS,
  SPECIES_CONTENT_TYPE_TERM,
  type Species,
} from '@rpg/contracts'
import { formatPreviewRailOverflowList, type PreviewRailFact } from '@rpg/ui'

import { getLanguageLabelFromVocabulary, getSenseLabelFromVocabulary } from '@/features/vocabulary'

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
import { getCreatureTypeLabel } from './creature-type-field-options'
import { heritageFromFormValues } from './species-heritage-form-values'
import type { SpeciesFormValues } from './species-form-fields'
import {
  SPECIES_STAT_LABELS,
  buildSpeciesDetailViewModel,
  type SpeciesDetailViewModel,
  type SpeciesDisplayVocabulary,
} from './species-display'
import { movementRowsToRecord } from './species-movement-form-fields'
import {
  SPECIES_CLASS_POLICY_MODE_LABELS,
  SPECIES_MULTICLASS_POLICY_LABELS,
} from './species-rules-form-labels'
import {
  mergeLevelLimitsFormDefaults,
  mergeMulticlassingFormDefaults,
} from './species-rules-form-values'
import { traitRowNameForIdAssignment, traitsFromFormValues } from './species-trait-form-values'
import { speciesCreateDefaultValues } from './species-form-values'

const PREVIEW_SPECIES_ENVELOPE = {
  rulesetId: 'srd-cc-5.2.1' as const,
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
  heritage: 'Heritage',
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

function formatClassLabel(classId: string, ctx: ContentFormCtx): string {
  const match = ctx.options?.classes?.visible.find(
    (cls) => cls.id === classId || cls.slug === classId,
  )
  return match?.name ?? classId
}

function speciesPreviewVocabulary(ctx: ContentFormCtx): SpeciesDisplayVocabulary {
  return {
    resolveCreatureTypeLabel: (id) => getCreatureTypeLabel(id, ctx),
    resolveLanguageLabel: (id) =>
      ctx.languageVocabulary ? getLanguageLabelFromVocabulary(ctx.languageVocabulary, id) : id,
    resolveSenseLabel: (type) =>
      ctx.senseVocabulary ? getSenseLabelFromVocabulary(ctx.senseVocabulary, type) : type,
    resolveSpell: () => undefined,
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
  _ctx: ContentFormCtx,
): ContentPreviewIdentity {
  return {
    name: speciesPreviewName(values),
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
    movement: movementRowsToRecord(values.movement),
    languageAffinities: values.languageAffinities,
    traits,
  }
  const statRows = buildSpeciesDetailViewModel(
    {
      ...PREVIEW_SPECIES_ENVELOPE,
      id: 'preview',
      name: speciesPreviewName(values),
      slug: 'preview',
      source: 'homebrew',
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
    const classLabels = (classPolicy.classIds ?? []).map((id) => formatClassLabel(id, ctx))
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
    source: 'homebrew',
    status: 'draft',
    description: values.description,
    creatureType: values.creatureType ?? speciesCreateDefaultValues.creatureType!,
    sizes: values.sizes ?? speciesCreateDefaultValues.sizes!,
    movement: movementRowsToRecord(values.movement ?? speciesCreateDefaultValues.movement!),
    languageAffinities: values.languageAffinities,
    traits: traitsFromFormValues(values.traits ?? []),
    heritage: heritageFromFormValues(values.heritage),
  }
}

export function buildSpeciesPreviewDetailViewModel(
  values: SpeciesFormValues,
  ctx: ContentFormCtx,
): SpeciesDetailViewModel {
  return buildSpeciesDetailViewModel(speciesDetailSourceFromFormValues(values), {
    ...speciesPreviewVocabulary(ctx),
    resolveSpell: () => undefined,
  })
}
