import {
  CLASS_CONTENT_TYPE_TERM,
  getAbilityLabel,
  getArmorCategoryEntry,
  getSpellPreparationModeLabel,
  getSpellcastingProgressionLabel,
  getWeaponCategoryEntry,
} from '@rpg/contracts'
import { formatPreviewRailOverflowList, type PreviewRailFact } from '@rpg/ui'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { isMeaningfulCharacterCreationToolChoice } from './character-creation/class-character-creation-proficiencies-form-values'
import {
  CONTENT_PREVIEW_DESCRIPTION_PLACEHOLDER,
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

function formatHitDie(hitDie: number | undefined): string {
  return `d${hitDie ?? 8}`
}

function formatPrimaryAbilities(
  abilities: ClassFormValues['primaryAbilities'] | undefined,
): string {
  return (abilities ?? []).map(getAbilityLabel).join(', ')
}

function identityFacts(values: ClassFormValues): PreviewRailFact[] {
  return [
    { label: CLASS_PREVIEW_FACT_LABELS.hitDie, value: formatHitDie(values.hitDie) },
    {
      label: CLASS_PREVIEW_FACT_LABELS.primaryAbilities,
      value: formatPrimaryAbilities(values.primaryAbilities),
    },
  ]
}

function formatArmorCategory(category: string): string {
  if (category === 'shields') return 'Shields'
  const label = getArmorCategoryEntry(category)?.label
  return label ? label.replace(/ Armor$/, ' armor') : category
}

function formatWeaponCategory(category: string): string {
  const label = getWeaponCategoryEntry(category)?.label
  return label ? label.replace(/ Weapon$/, ' weapons') : category
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
  if (items.length === 0) return
  facts.push({ label, value: formatPreviewRailOverflowList(items) })
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
    facts: identityFacts(values),
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
    (proficiencies?.savingThrows ?? []).map(getAbilityLabel),
  )
  appendFact(
    facts,
    CLASS_PREVIEW_FACT_LABELS.armorTraining,
    (proficiencies?.armor ?? []).map(formatArmorCategory),
  )

  const weapons = [
    ...(proficiencies?.weapons.categories ?? []).map(formatWeaponCategory),
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

  if (spellcasting.ability) {
    facts.push({
      label: CLASS_PREVIEW_FACT_LABELS.spellcastingAbility,
      value: getAbilityLabel(spellcasting.ability),
    })
  }
  if (spellcasting.level != null) {
    facts.push({
      label: CLASS_PREVIEW_FACT_LABELS.spellcastingLevel,
      value: String(spellcasting.level),
    })
  }
  if (spellcasting.progression) {
    facts.push({
      label: CLASS_PREVIEW_FACT_LABELS.progression,
      value: getSpellcastingProgressionLabel(spellcasting.progression),
    })
  }

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

function buildCharacterCreationSection(
  values: ClassFormValues,
  ctx: ContentFormCtx,
): ContentPreviewSection {
  if (!isCharacterCreationConfigured(values)) {
    return {
      derivedKind: 'notConfigured',
      status: CONTENT_PREVIEW_STATUS_NOT_CONFIGURED,
    }
  }

  const facts: PreviewRailFact[] = []
  const skillFrom = values.characterCreation?.proficiencies?.skills.from ?? []
  const skillChoose = values.characterCreation?.proficiencies?.skills.choose ?? 0
  if (skillFrom.length > 0) {
    facts.push({
      label: CLASS_PREVIEW_FACT_LABELS.skillChoices,
      value: `Choose ${skillChoose} · ${formatPreviewRailOverflowList(
        skillFrom.map((slug) => skillLabel(slug, ctx)),
      )}`,
    })
  }

  const equipmentCount = values.characterCreation?.startingEquipment?.options.length ?? 0
  if (equipmentCount > 0) {
    facts.push({
      label: CLASS_PREVIEW_FACT_LABELS.startingEquipment,
      value: `${equipmentCount} ${equipmentCount === 1 ? 'option' : 'options'}`,
    })
  }

  return {
    derivedKind: 'ready',
    status: CONTENT_PREVIEW_STATUS_READY,
    facts,
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
    primaryAbilities: values.primaryAbilities ?? ['str'],
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
