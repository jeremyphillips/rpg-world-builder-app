import {
  CREATURE_DAMAGE_DEFENSE_LIST_ENTRIES,
  EFFECT_CONDITION_IDS,
  getEffectConditionLabel,
  TELEPATHY_TERM,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
} from '@rpg/contracts'
import { vocabularyFieldLabel } from '@/features/vocabulary/lib/term-labels'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { modeDependentGrantSetField } from '@/lib/forms/mode-dependent-grant-set-form-fields'

import { referenceWeaponFieldOptions } from '../../lib/form-options/content-field-option.lib'
import { resolveContentWeaponGrantOptionLabel } from '../../lib/forms/grants/content-weapon-grant-option-label.lib'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  WEAPON_PROFICIENCY_MODES,
  type WeaponProficiencyMode,
} from '../../classes/lib/class-form-constants'
import {
  INDIVIDUAL_WEAPONS_TOGGLE_HINT,
  WEAPON_PROFICIENCIES_HINT,
  WEAPON_PROFICIENCY_MODE_LABELS,
} from '../../classes/lib/class-form-labels'
import {
  MonsterCreatureDetailsLanguagesSlot,
  MonsterCreatureDetailsSensesSlot,
  MonsterCreatureDetailsSkillsSlot,
  MonsterTelepathyRangeField,
} from '../components/form/monster-creature-details-slots'
import { damageDefenseComboboxOptions } from './monster-damage-defense-form.lib'
import { MONSTER_WEAPON_PROFICIENCIES_HEADING } from './monster-form-labels'
import type { MonsterFormValues } from './monster-form-values'

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

function weaponProficiencyFields(ctx: ContentFormCtx): FormItem[] {
  return [
    modeDependentGrantSetField({
      modeFieldName: 'weaponProficiencyMode',
      modes: WEAPON_PROFICIENCY_MODES,
      modeLabels: WEAPON_PROFICIENCY_MODE_LABELS,
      categoriesPath: 'proficiencies.weapons.categories',
      itemsPath: 'proficiencies.weapons.items',
      label: MONSTER_WEAPON_PROFICIENCIES_HEADING,
      hint: { text: INDIVIDUAL_WEAPONS_TOGGLE_HINT, position: 'below-control' },
      categoryOptions: weaponCategoryOptions,
      itemOptions: referenceWeaponFieldOptions(ctx.options?.equipment),
      categoriesLabel: 'Categories',
      itemsLabel: 'Weapon choices',
      categoriesHint: WEAPON_PROFICIENCIES_HINT,
      categoryMode: 'categories' satisfies WeaponProficiencyMode,
      specificMode: 'individual' satisfies WeaponProficiencyMode,
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
          heading: { label: 'Languages' },
          render: () => <MonsterCreatureDetailsLanguagesSlot ctx={ctx} />,
        },
      ],
    },
    {
      kind: 'group',
      legend: 'Senses',
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
          fields: [
            damageDefenseField(ctx, 'vulnerabilities'),
            damageDefenseField(ctx, 'resistances'),
            damageDefenseField(ctx, 'immunities'),
          ],
        },
        {
          kind: 'group',
          legend: 'Condition immunities',
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
