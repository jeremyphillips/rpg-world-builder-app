import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  FEAT_CATEGORY_IDS,
  FEAT_CATEGORY_ENTRIES,
  INNATE_SPELL_KINDS,
  SENSE_RANGES,
  SKILL_IDS,
  SKILLS,
  USAGE_FREQUENCIES,
  USAGE_FREQUENCY_ENTRIES,
  type UsageFrequency,
  type FeatCategory,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FieldVisibility, type FormItem } from '@rpg/ui/form'

import {
  buildActiveDamageTypeFieldOptions,
  buildActiveLanguageFieldOptions,
  buildActiveSenseFieldOptions,
} from '@/features/homebrew'

import type { ContentFormCtx } from '../content-form-registry'
import { feetInputUnitField } from '../fields/content-identity-form-fields'
import { getLevelFieldOptions, levelSelectDigits } from '../../form-options/level-field-options'
import { titleCase } from '../../utils/title-case'

const senseRangeOptions: FieldOption[] = SENSE_RANGES.map((r) => ({
  value: String(r),
  label: `${r} ft.`,
}))

const skillOptions = toOptions(SKILL_IDS, SKILLS as Record<(typeof SKILL_IDS)[number], string>)

const armorCategoryOptions = toOptions(
  ARMOR_CATEGORIES,
  Object.fromEntries(ARMOR_CATEGORIES.map((c) => [c, ARMOR_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof ARMOR_CATEGORIES)[number],
    string
  >,
)

const abilityOptions = toOptions(
  ABILITY_IDS,
  Object.fromEntries(ABILITY_IDS.map((id) => [id, ABILITY_ENTRIES[id].label])) as Record<
    (typeof ABILITY_IDS)[number],
    string
  >,
)

const innateSpellKindOptions = toOptions(
  INNATE_SPELL_KINDS,
  Object.fromEntries(
    INNATE_SPELL_KINDS.map((k) => [k, titleCase(k.replaceAll('_', ' '))]),
  ) as Record<(typeof INNATE_SPELL_KINDS)[number], string>,
)

const usageFrequencyOptions = toOptions(
  USAGE_FREQUENCIES,
  Object.fromEntries(USAGE_FREQUENCIES.map((f) => [f, USAGE_FREQUENCY_ENTRIES[f].label])) as Record<
    UsageFrequency,
    string
  >,
)

const featCategoryOptions = toOptions(
  FEAT_CATEGORY_IDS,
  Object.fromEntries(
    FEAT_CATEGORY_IDS.map((id) => [id, FEAT_CATEGORY_ENTRIES[id].label]),
  ) as Record<FeatCategory, string>,
)

function visibleFor<T extends string>(value: T): FieldVisibility {
  return {
    dependsOn: ['grantType'],
    visibleWhen: (watched) => watched['grantType'] === value,
  }
}

function grantTypeOptionsFor<T extends string>(
  grantTypes: readonly T[],
  labels: Record<T, string>,
): FieldOption[] {
  return grantTypes.map((t) => ({ value: t, label: labels[t] }))
}

export function formatInnateSpellEntryTitle(
  spellIds: string[] | undefined,
  spellOptions: FieldOption[],
  index: number,
): string {
  if (!spellIds?.length) return `Entry ${index + 1}`
  const labels = spellIds.map(
    (id) => spellOptions.find((option) => option.value === id)?.label ?? id,
  )
  return labels.length <= 2 ? labels.join(', ') : `${labels.length} spells`
}

export function grantItemFields<T extends string>(
  grantTypes: readonly T[],
  labels: Record<T, string>,
  ctx: ContentFormCtx,
): FormItem[] {
  const spellOptions = ctx.options?.spells ?? []
  const toolOptions = ctx.options?.tools ?? []
  const weaponOptions = ctx.options?.weapons ?? []
  const featOptions = ctx.options?.feats ?? []
  const damageTypeOptions = buildActiveDamageTypeFieldOptions(ctx.damageTypeVocabulary)
  const senseTypeOptions = buildActiveSenseFieldOptions(ctx.senseVocabulary)
  const languageOptions = buildActiveLanguageFieldOptions(ctx.languageVocabulary)

  return [
    {
      type: 'select',
      name: 'grantType',
      label: 'Grant type',
      options: grantTypeOptionsFor(grantTypes, labels),
      required: true,
    },
    {
      type: 'chips',
      name: 'resistances',
      label: 'Damage types',
      options: damageTypeOptions,
      visibility: visibleFor('resistances'),
    },
    {
      type: 'chips',
      name: 'damageType',
      label: 'Damage types',
      options: damageTypeOptions,
      visibility: visibleFor('damageType'),
    },
    {
      type: 'select',
      name: 'senseType',
      label: 'Sense type',
      options: senseTypeOptions,
      visibility: visibleFor('senses'),
    },
    {
      type: 'select',
      name: 'senseRange',
      label: 'Range',
      options: senseRangeOptions,
      visibility: visibleFor('senses'),
    },
    feetInputUnitField('speedWalkOverride', 'Walk speed', {
      visibility: visibleFor('speedOverride'),
    }),
    {
      type: 'select',
      name: 'language',
      label: 'Language',
      options: languageOptions,
      visibility: visibleFor('languages'),
    },
    {
      type: 'chips',
      name: 'proficiencySkills',
      label: 'Skills',
      options: skillOptions,
      visibility: visibleFor('proficiencies'),
    },
    {
      type: 'chips',
      name: 'proficiencyArmor',
      label: 'Armor',
      options: armorCategoryOptions,
      visibility: visibleFor('proficiencies'),
    },
    {
      type: 'combobox',
      name: 'proficiencyTools',
      label: 'Tools',
      multiple: true,
      options: toolOptions,
      placeholder: 'Choose tools…',
      visibility: visibleFor('proficiencies'),
    },
    {
      type: 'combobox',
      name: 'proficiencyWeapons',
      label: 'Weapons',
      multiple: true,
      options: weaponOptions,
      placeholder: 'Choose weapons…',
      visibility: visibleFor('proficiencies'),
    },
    {
      type: 'select',
      name: 'innateSpellAbility',
      label: 'Spellcasting ability',
      options: abilityOptions,
      visibility: visibleFor('innateSpells'),
    },
    {
      kind: 'array',
      name: 'innateSpellEntries',
      legend: 'Innate spell entries',
      addLabel: 'Add entry',
      itemCollapsible: true,
      visibility: visibleFor('innateSpells'),
      itemHeader: {
        fallback: (index) => `Entry ${index + 1}`,
        primary: (values, index) =>
          formatInnateSpellEntryTitle(
            values['spellIds'] as string[] | undefined,
            spellOptions,
            index,
          ),
      },
      fields: [
        {
          type: 'select',
          name: 'level',
          label: 'Character level',
          options: getLevelFieldOptions(ctx),
          digits: levelSelectDigits(ctx),
          required: true,
        },
        {
          type: 'combobox',
          name: 'spellIds',
          label: 'Spells',
          multiple: true,
          options: spellOptions,
          placeholder: 'Choose spells…',
          required: true,
        },
        {
          type: 'select',
          name: 'kind',
          label: 'Kind',
          options: innateSpellKindOptions,
          defaultValue: 'free_cast',
        },
        {
          type: 'select',
          name: 'frequency',
          label: 'Frequency',
          options: usageFrequencyOptions,
          visibility: {
            dependsOn: ['kind'],
            visibleWhen: (watched) =>
              watched['kind'] === undefined || watched['kind'] === 'free_cast',
          },
        },
      ],
    },
    {
      type: 'select',
      name: 'featCategory',
      label: 'Feat category',
      options: featCategoryOptions,
      required: true,
      visibility: visibleFor('featChoice'),
    },
    {
      type: 'number',
      name: 'featChoose',
      label: 'Number to choose',
      min: 1,
      defaultValue: 1,
      visibility: visibleFor('featChoice'),
      digits: 1,
    },
    {
      type: 'checkbox',
      name: 'featAllowAnyQualifying',
      label: 'Allow any qualifying feat (Epic Boon or another feat the character qualifies for)',
      visibility: {
        dependsOn: ['grantType', 'featCategory'],
        visibleWhen: (watched) =>
          watched['grantType'] === 'featChoice' &&
          (watched['featCategory'] === 'epic-boon' || watched['featCategory'] === 'general'),
      },
    },
    {
      type: 'combobox',
      name: 'featRecommendedIds',
      label: 'Recommended feats',
      multiple: true,
      options: featOptions,
      placeholder: 'Choose feats…',
      visibility: visibleFor('featChoice'),
    },
    {
      type: 'checkbox',
      name: 'featReplaceable',
      label: 'Replaceable on later class levels',
      visibility: visibleFor('featChoice'),
    },
  ]
}

export function grantArrayFields<T extends string>(
  grantTypes: readonly T[],
  labels: Record<T, string>,
  ctx: ContentFormCtx,
): FormItem[] {
  return [
    {
      kind: 'array',
      name: 'grants',
      legend: 'Grants',
      addLabel: 'Add grant',
      itemCollapsible: true,
      itemHeader: {
        fallback: (index) => `Grant ${index + 1}`,
        primary: (values) => {
          const type = values['grantType'] as T | undefined
          return type ? labels[type] : undefined
        },
      },
      fields: grantItemFields(grantTypes, labels, ctx),
    },
  ]
}
