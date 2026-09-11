import {
  CLASS_CONTENT_TYPE_TERM,
  getAbilityCompactLabel,
  getArmorCategoryPreviewLabel,
  getSpellPreparationModeLabel,
  getSpellcastingProgressionLabel,
  getWeaponCategoryPreviewLabel,
} from '@rpg/contracts'
import { formatPreviewRailOverflowList, type PreviewRailFact } from '@rpg/ui'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { isMeaningfulCharacterCreationToolChoice } from './character-creation/class-character-creation-proficiencies-form-values'
import {
  CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER,
  CONTENT_PREVIEW_NOT_SET,
  CONTENT_PREVIEW_STATUS_NONE,
  CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
  CONTENT_PREVIEW_STATUS_OFF,
  CONTENT_PREVIEW_STATUS_READY,
  contentPreviewDefaultFeaturesStatus,
  contentPreviewFeaturesStatus,
  contentPreviewUnnamedName,
} from '../../lib/forms/preview/content-form-preview-copy'
import type {
  ContentPreviewDetail,
  ContentPreviewIdentity,
  ContentPreviewResources,
  ContentPreviewSection,
} from '../../lib/forms/preview/content-form-preview.types'
import { featuresFromFormValues } from './class-feature-form-fields'
import type { ClassFormValues } from './class-form-fields'
import { classCreateDefaultValues, proficienciesFromFormValues } from './class-form-values'
import {
  buildClassDetailViewModel,
  type ClassDetailViewModel,
  type ClassDetailViewModelSource,
  type ClassDisplayVocabulary,
} from './class-display'

export const CLASS_PREVIEW_FACT_LABELS = {
  hitDie: 'Hit die',
  primaryAbilities: 'Primary abilities',
  savingThrows: 'Saving throws',
  armorTraining: 'Armor training',
  weapons: 'Weapons',
  skills: 'Skills',
  spellcastingAbility: 'Spellcasting ability',
  spellcastingLevel: 'Spellcasting level',
  progression: 'Progression',
  skillChoices: 'Skill choices',
  startingEquipment: 'Starting equipment',
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

function classPreviewName(values: ClassFormValues): string {
  const trimmed = values.name?.trim()
  return trimmed ? trimmed : contentPreviewUnnamedName(CLASS_CONTENT_TYPE_TERM)
}

function formatHitDiePreview(hitDie: ClassFormValues['hitDie'] | string | undefined): string {
  if (hitDie === undefined || hitDie === null || hitDie === '') {
    return CONTENT_PREVIEW_NOT_SET
  }

  const face = Number(hitDie)
  if (!Number.isFinite(face) || face <= 0) {
    return CONTENT_PREVIEW_NOT_SET
  }

  return `d${face}`
}

function formatPrimaryAbilitiesPreview(
  abilities: ClassFormValues['primaryAbilities'] | undefined,
): string {
  const labels = (abilities ?? []).map(getAbilityCompactLabel)
  return labels.length > 0 ? labels.join(', ') : CONTENT_PREVIEW_NOT_SET
}

function identityFacts(values: ClassFormValues): PreviewRailFact[] {
  return [
    { label: CLASS_PREVIEW_FACT_LABELS.hitDie, value: formatHitDiePreview(values.hitDie) },
    {
      label: CLASS_PREVIEW_FACT_LABELS.primaryAbilities,
      value: formatPrimaryAbilitiesPreview(values.primaryAbilities),
    },
  ]
}

function formatSlugLabel(slug: string): string {
  return slug
    .split('-')
    .map((part) => (part.length > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ')
}

function skillLabel(slug: string, ctx: ContentFormCtx): string {
  const match = ctx.options?.skills?.visible.find(
    (skill) => skill.id === slug || skill.slug === slug,
  )
  return match?.name ?? formatSlugLabel(slug)
}

function appendFact(facts: PreviewRailFact[], label: string, items: readonly string[]): void {
  facts.push({
    label,
    value: items.length > 0 ? formatPreviewRailOverflowList(items) : CONTENT_PREVIEW_NOT_SET,
  })
}

function isSeededDefaultFeatureSet(features: ClassFormValues['features'] | undefined): boolean {
  const seeded = classCreateDefaultValues.features ?? []
  if (!features || features.length !== seeded.length) return false

  return features.every((row, index) => {
    const seed = seeded[index]
    return (
      seed != null && row.kind === seed.kind && row.level === seed.level && row.name === seed.name
    )
  })
}

function isCharacterCreationConfigured(values: ClassFormValues): boolean {
  const skillsFrom = values.characterCreation?.proficiencies?.skills.from ?? []
  const equipmentOptions = values.characterCreation?.startingEquipment?.options ?? []
  const toolsConfigured = isMeaningfulCharacterCreationToolChoice(
    values.characterCreation?.proficiencies?.tools,
  )
  return skillsFrom.length > 0 || equipmentOptions.length > 0 || toolsConfigured
}

export function buildClassPreviewIdentity(
  values: ClassFormValues,
  _ctx: ContentFormCtx,
): ContentPreviewIdentity {
  return {
    name: classPreviewName(values),
  }
}

function buildBasicsSection(values: ClassFormValues): ContentPreviewSection {
  const snippet = htmlToPreviewSnippet(values.description)

  return {
    derivedKind: 'ready',
    status: CONTENT_PREVIEW_STATUS_READY,
    description: snippet ?? CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER,
    facts: identityFacts(values),
  }
}

function buildProficienciesSection(
  values: ClassFormValues,
  ctx: ContentFormCtx,
): ContentPreviewSection {
  const proficiencies = values.proficiencies
  const facts: PreviewRailFact[] = []

  appendFact(
    facts,
    CLASS_PREVIEW_FACT_LABELS.savingThrows,
    (proficiencies?.savingThrows ?? []).map(getAbilityCompactLabel),
  )
  appendFact(
    facts,
    CLASS_PREVIEW_FACT_LABELS.armorTraining,
    (proficiencies?.armor ?? []).map(getArmorCategoryPreviewLabel),
  )

  const weapons = [
    ...(proficiencies?.weapons.categories ?? []).map(getWeaponCategoryPreviewLabel),
    ...(proficiencies?.weapons.items ?? []).map(formatSlugLabel),
  ]
  appendFact(facts, CLASS_PREVIEW_FACT_LABELS.weapons, weapons)
  appendFact(
    facts,
    CLASS_PREVIEW_FACT_LABELS.skills,
    (proficiencies?.skills.items ?? []).map((slug) => skillLabel(slug, ctx)),
  )

  return {
    derivedKind: 'ready',
    status: CONTENT_PREVIEW_STATUS_READY,
    facts,
  }
}

function spellcastingDerivedKind(
  preparation: string | undefined,
): ContentPreviewSection['derivedKind'] {
  if (preparation === 'known') return 'known'
  if (preparation === 'full_list') return 'fullList'
  return 'prepared'
}

function spellcastingFacts(
  spellcasting: ClassFormValues['spellcasting'] | undefined,
): PreviewRailFact[] {
  const facts: PreviewRailFact[] = []
  if (!spellcasting) return facts

  facts.push({
    label: CLASS_PREVIEW_FACT_LABELS.spellcastingAbility,
    value: spellcasting.ability
      ? getAbilityCompactLabel(spellcasting.ability)
      : CONTENT_PREVIEW_NOT_SET,
  })
  facts.push({
    label: CLASS_PREVIEW_FACT_LABELS.spellcastingLevel,
    value: spellcasting.level != null ? String(spellcasting.level) : CONTENT_PREVIEW_NOT_SET,
  })
  facts.push({
    label: CLASS_PREVIEW_FACT_LABELS.progression,
    value: spellcasting.progression
      ? getSpellcastingProgressionLabel(spellcasting.progression)
      : CONTENT_PREVIEW_NOT_SET,
  })

  return facts
}

function buildSpellcastingSection(values: ClassFormValues): ContentPreviewSection {
  if (!values.hasSpellcasting) {
    return {
      derivedKind: 'off',
      status: CONTENT_PREVIEW_STATUS_OFF,
    }
  }

  const spellcasting = values.spellcasting
  const preparation = spellcasting?.preparation

  return {
    derivedKind: spellcastingDerivedKind(preparation),
    status: preparation ? getSpellPreparationModeLabel(preparation) : CONTENT_PREVIEW_STATUS_READY,
    facts: spellcastingFacts(spellcasting),
  }
}

function buildFeaturesSection(values: ClassFormValues): ContentPreviewSection {
  const features = values.features ?? []
  if (features.length === 0) {
    return {
      derivedKind: 'none',
      status: CONTENT_PREVIEW_STATUS_NONE,
    }
  }

  const count = features.length
  const isDefault = isSeededDefaultFeatureSet(features)

  return {
    derivedKind: 'count',
    status: isDefault
      ? contentPreviewDefaultFeaturesStatus(count)
      : contentPreviewFeaturesStatus(count),
    facts: [
      {
        label: 'Features',
        value: formatPreviewRailOverflowList(
          features.map((feature) => feature.name?.trim() || 'Unnamed feature'),
        ),
      },
    ],
  }
}

function buildSubclassesSection(resources?: ContentPreviewResources): ContentPreviewSection {
  const subclasses = resources?.subclasses ?? []
  if (subclasses.length === 0) {
    return {
      derivedKind: 'none',
      status: CONTENT_PREVIEW_STATUS_NONE,
    }
  }

  return {
    derivedKind: 'count',
    status: String(subclasses.length),
    facts: [
      {
        label: 'Subclasses',
        value: formatPreviewRailOverflowList(subclasses.map((subclass) => subclass.name)),
      },
    ],
  }
}

function buildCharacterCreationFacts(
  values: ClassFormValues,
  ctx: ContentFormCtx,
): PreviewRailFact[] {
  const facts: PreviewRailFact[] = []
  const skillFrom = values.characterCreation?.proficiencies?.skills.from ?? []
  const skillChoose = values.characterCreation?.proficiencies?.skills.choose ?? 0

  facts.push({
    label: CLASS_PREVIEW_FACT_LABELS.skillChoices,
    value:
      skillFrom.length > 0
        ? `Choose ${skillChoose} · ${formatPreviewRailOverflowList(
            skillFrom.map((slug) => skillLabel(slug, ctx)),
          )}`
        : CONTENT_PREVIEW_NOT_SET,
  })

  const equipmentCount = values.characterCreation?.startingEquipment?.options.length ?? 0
  facts.push({
    label: CLASS_PREVIEW_FACT_LABELS.startingEquipment,
    value:
      equipmentCount > 0
        ? `${equipmentCount} ${equipmentCount === 1 ? 'option' : 'options'}`
        : CONTENT_PREVIEW_NOT_SET,
  })

  return facts
}

function buildCharacterCreationSection(
  values: ClassFormValues,
  ctx: ContentFormCtx,
): ContentPreviewSection {
  const facts = buildCharacterCreationFacts(values, ctx)
  const configured = isCharacterCreationConfigured(values)

  return {
    derivedKind: configured ? 'ready' : 'notConfigured',
    status: configured ? CONTENT_PREVIEW_STATUS_READY : CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
    ...(configured ? { facts } : {}),
  }
}

export function buildClassPreviewSections(
  values: ClassFormValues,
  ctx: ContentFormCtx,
  resources?: ContentPreviewResources,
): Record<string, ContentPreviewSection | null> {
  return {
    basics: buildBasicsSection(values),
    proficiencies: buildProficienciesSection(values, ctx),
    spellcasting: buildSpellcastingSection(values),
    features: buildFeaturesSection(values),
    subclasses: buildSubclassesSection(resources),
    characterCreation: buildCharacterCreationSection(values, ctx),
  }
}

function classPreviewVocabulary(ctx: ContentFormCtx): ClassDisplayVocabulary {
  return {
    resolveToolLabel: (slug: string) => {
      const match = ctx.options?.equipment?.visible.find(
        (item) => item.slug === slug || item.id === slug,
      )
      return match?.name ?? formatSlugLabel(slug)
    },
  }
}

export function classDetailSourceFromFormValues(
  values: ClassFormValues,
): ClassDetailViewModelSource {
  return {
    name: classPreviewName(values),
    hitDie: values.hitDie ?? 8,
    primaryAbilities: values.primaryAbilities ?? [],
    description: values.description,
    proficiencies: proficienciesFromFormValues(
      values.proficiencies ?? classCreateDefaultValues.proficiencies!,
      values.weaponProficiencyMode === 'individual',
    ),
    features: featuresFromFormValues(values.features ?? []),
    characterCreation: {
      proficiencies: {
        skills: {
          choices: [
            {
              id: 'class-skills',
              choose: values.characterCreation?.proficiencies?.skills.choose ?? 0,
              from: values.characterCreation?.proficiencies?.skills.from ?? [],
            },
          ],
        },
      },
    },
  }
}

export function buildClassPreviewDetailViewModel(
  values: ClassFormValues,
  ctx: ContentFormCtx,
): ClassDetailViewModel {
  return buildClassDetailViewModel(
    classDetailSourceFromFormValues(values),
    classPreviewVocabulary(ctx),
    {
      surface: 'content-detail',
    },
  )
}

export function buildClassPreviewDetail(
  values: ClassFormValues,
  ctx: ContentFormCtx,
): ContentPreviewDetail {
  return {
    name: classPreviewName(values),
    descriptionHtml: values.description,
    viewModel: buildClassPreviewDetailViewModel(values, ctx),
  }
}
