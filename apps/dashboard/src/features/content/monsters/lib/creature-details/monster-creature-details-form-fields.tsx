import {
  CREATURE_DAMAGE_DEFENSE_LIST_ENTRIES,
  EFFECT_CONDITION_IDS,
  creatureWeaponProficienciesSchema,
  creatureWeaponProficiencyTargetsFromGrantSet,
  getEffectConditionLabel,
  TELEPATHY_TERM,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
} from '@rpg/contracts'
import { vocabularyFieldLabel } from '@/features/vocabulary/lib/term-labels'
import { toOptions, type FieldOption, type FormItem } from '@rpg/ui/form'

import { createElement } from 'react'

import { prepareWeaponProficiencyComboboxOptions } from '@/lib/forms/grant-sets/prepare-weapon-proficiency-combobox-options.lib'
import { weaponProficiencyGrantSetField } from '@/lib/forms/grant-sets/weapon-proficiency-grant-field'
import { weaponProficiencyGrantSetFromMode } from '@/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib'

import { MonsterWeaponProficiencyReconciliationField } from '../../components/monster-weapon-proficiency-reconciliation-field'
import { resolveMonsterWeaponProficiencyRecommendationGroup } from './monster-weapon-proficiency-recommendations.lib'
import { equipmentProficiencyGrantComboboxConfig } from '@/lib/forms/grant-sets/equipment-proficiency-grant-combobox-config.lib'
import { resolveContentWeaponGrantOptionLabel } from '../../../lib/forms/grants/content-weapon-grant-option-label.lib'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  MonsterCreatureDetailsLanguagesSlot,
  MonsterCreatureDetailsSensesSlot,
  MonsterCreatureDetailsSkillsSlot,
  MonsterTelepathyRangeField,
} from '../../components/form/monster-creature-details-slots'
import { damageDefenseComboboxOptions } from './monster-damage-defense-form.lib'
import { MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE } from './monster-weapon-proficiencies-form.lib'
import {
  MONSTER_CONDITION_IMMUNITIES_HINT,
  MONSTER_DAMAGE_DEFENSES_HINT,
  MONSTER_SENSES_HINT,
  MONSTER_WEAPON_PROFICIENCIES_HEADING,
  MONSTER_WEAPON_PROFICIENCY_CATEGORIES_HINT,
  MONSTER_WEAPON_PROFICIENCY_MODE_HINT,
} from '../monster-form-labels'
import type { MonsterFormValues } from '../monster-form-values'

const weaponCategoryOptions = toOptions(
  WEAPON_CATEGORIES,
  Object.fromEntries(WEAPON_CATEGORIES.map((c) => [c, WEAPON_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof WEAPON_CATEGORIES)[number],
    string
  >,
)

function damageTypeOptions(ctx: ContentFormCtx) {
  return [...(ctx.damageTypeVocabulary?.activeIds ?? [])].map((id) => ({
    value: id,
    label: ctx.damageTypeVocabulary?.labelById[id] ?? id,
  }))
}

function damageDefenseField(
  ctx: ContentFormCtx,
  list: keyof typeof CREATURE_DAMAGE_DEFENSE_LIST_ENTRIES,
): FormItem {
  const label = CREATURE_DAMAGE_DEFENSE_LIST_ENTRIES[list].label
  const staticOptions = damageTypeOptions(ctx)

  return {
    type: 'combobox',
    name: `defenses.${list}`,
    label,
    multiple: true,
    enableSearch: false,
    optionsResolve: {
      dependsOn: ['defenses'],
      optionsWhen: (values) =>
        damageDefenseComboboxOptions(
          list,
          (values.defenses ?? {
            vulnerabilities: [],
            resistances: [],
            immunities: [],
            conditionImmunities: [],
          }) as MonsterFormValues['defenses'],
          staticOptions,
        ),
    },
    width: 'full',
  }
}

function monsterWeaponProficiencyOptions(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
  options: readonly FieldOption[],
): FieldOption[] {
  const buckets = values.proficiencies?.weapons ?? { categories: [], items: [] }
  const grant = creatureWeaponProficienciesSchema.parse(
    weaponProficiencyGrantSetFromMode(
      values.weaponProficiencyMode ?? MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
      buckets,
    ),
  )
  const catalog = ctx.equipmentCatalogById ? [...ctx.equipmentCatalogById.values()] : []
  return prepareWeaponProficiencyComboboxOptions({
    options,
    equipmentCatalog: catalog,
    targets: creatureWeaponProficiencyTargetsFromGrantSet(grant),
    inventory: (values.equipment ?? []).map((entry) => ({
      equipmentId: entry.equipmentId,
      quantity: entry.quantity ?? 1,
      equipped: entry.equipped === true,
    })),
    selectedIds: new Set(grant.items),
  })
}

function weaponProficiencyFields(ctx: ContentFormCtx): FormItem[] {
  const weaponCombobox = equipmentProficiencyGrantComboboxConfig(ctx.options?.equipment, 'weapon')
  return [
    {
      kind: 'slot',
      name: 'weaponProficiencyReconciliation',
      render: () => createElement(MonsterWeaponProficiencyReconciliationField),
    },
    weaponProficiencyGrantSetField({
      modeFieldName: 'weaponProficiencyMode',
      categoriesPath: 'proficiencies.weapons.categories',
      itemsPath: 'proficiencies.weapons.items',
      label: MONSTER_WEAPON_PROFICIENCIES_HEADING,
      hint: { text: MONSTER_WEAPON_PROFICIENCY_MODE_HINT, position: 'below-control' },
      categoryOptions: weaponCategoryOptions,
      itemOptions: weaponCombobox.itemOptions,
      itemsCombobox: {
        ...weaponCombobox.itemsCombobox,
        optionsResolve: {
          dependsOn: ['equipment', 'proficiencies.weapons', 'weaponProficiencyMode'],
          optionsWhen: (values) =>
            monsterWeaponProficiencyOptions(
              values as MonsterFormValues,
              ctx,
              weaponCombobox.itemOptions,
            ),
        },
        recommendationResolve: {
          dependsOn: ['equipment', 'proficiencies.weapons', 'weaponProficiencyMode'],
          recommendationWhen: (values, form) =>
            resolveMonsterWeaponProficiencyRecommendationGroup(
              values as MonsterFormValues,
              ctx,
              weaponCombobox.itemOptions,
              form,
            ),
        },
      },
      categoriesLabel: 'Categories',
      itemsLabel: 'Weapon choices',
      categoriesHint: MONSTER_WEAPON_PROFICIENCY_CATEGORIES_HINT,
      resolveOptionLabel: (value) =>
        resolveContentWeaponGrantOptionLabel(value, ctx.options, ctx.equipmentCatalogById),
    }),
  ]
}

export function creatureDetailsFields(ctx: ContentFormCtx): FormItem[] {
  const conditionOptions = EFFECT_CONDITION_IDS.map((id) => ({
    value: id,
    label: getEffectConditionLabel(id),
  }))

  return [
    {
      kind: 'group',
      legend: 'Proficiencies',
      fields: [
        {
          kind: 'slot',
          name: 'proficiencies.skills',
          heading: { label: 'Skill Proficiencies' },
          render: () => <MonsterCreatureDetailsSkillsSlot ctx={ctx} />,
        },
        ...weaponProficiencyFields(ctx),
        {
          kind: 'slot',
          name: 'proficiencies.languages',
          render: () => <MonsterCreatureDetailsLanguagesSlot ctx={ctx} />,
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Senses',
      description: MONSTER_SENSES_HINT,
      fields: [
        {
          kind: 'slot',
          name: 'senses',
          render: () => <MonsterCreatureDetailsSensesSlot ctx={ctx} />,
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Communication',
      fields: [
        {
          kind: 'slot',
          name: 'communication.telepathy',
          heading: { label: vocabularyFieldLabel(TELEPATHY_TERM) },
          render: () => <MonsterTelepathyRangeField />,
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Defenses',
      fields: [
        {
          kind: 'group',
          legend: 'Damage defenses',
          description: MONSTER_DAMAGE_DEFENSES_HINT,
          fields: [
            damageDefenseField(ctx, 'vulnerabilities'),
            damageDefenseField(ctx, 'resistances'),
            damageDefenseField(ctx, 'immunities'),
          ],
        },
        {
          kind: 'group',
          legend: 'Condition immunities',
          description: MONSTER_CONDITION_IMMUNITIES_HINT,
          fields: [
            {
              type: 'combobox',
              name: 'defenses.conditionImmunities',
              label: 'Condition immunities',
              labelVisibility: 'srOnly',
              multiple: true,
              enableSearch: false,
              options: conditionOptions,
              width: 'full',
            },
          ],
        },
      ],
    },
  ]
}
