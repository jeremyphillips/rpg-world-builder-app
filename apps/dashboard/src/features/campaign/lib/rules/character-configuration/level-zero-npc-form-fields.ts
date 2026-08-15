import { z } from 'zod'
import {
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  CLASS_HIT_DICE,
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  formatHitDie,
  hitDieSchema,
  levelZeroProficiencyBonusSchema,
} from '@rpg/contracts'
import { toOptions, type FieldOption, type FormItem } from '@rpg/ui/form'

import {
  wealthGrantMoneyField,
  type WealthGrantMoneyForm,
} from '@/lib/forms/wealth-grant-form-fields'

import { languageGrantItemsField } from './language-grant-form-fields'
import { standardArrayFormFields } from '@/lib/forms/standard-array-form-fields'
import {
  XOR_GRANT_SET_MODES,
  xorProficiencyGrantSetField,
  type XorGrantSetMode,
} from '@/lib/forms/mode-dependent-grant-set-form-fields'

export const LEVEL_ZERO_NPCS_ENABLED = 'levelZeroNpcsEnabled' as const

export const LEVEL_ZERO_ARMOR_MODE = 'levelZeroArmorGrantMode' as const
export const LEVEL_ZERO_ARMOR_CATEGORIES_PATH = 'levelZeroArmorProficiencies.categories' as const
export const LEVEL_ZERO_ARMOR_ITEMS_PATH = 'levelZeroArmorProficiencies.items' as const

export const LEVEL_ZERO_WEAPON_MODE = 'levelZeroWeaponGrantMode' as const
export const LEVEL_ZERO_WEAPON_CATEGORIES_PATH = 'levelZeroWeaponProficiencies.categories' as const
export const LEVEL_ZERO_WEAPON_ITEMS_PATH = 'levelZeroWeaponProficiencies.items' as const

export const LEVEL_ZERO_LANGUAGE_ITEMS_PATH = 'levelZeroLanguageProficiencies.items' as const
export const LEVEL_ZERO_STARTING_WEALTH_PATH = 'levelZeroStartingWealth' as const

const hitDieOptions: FieldOption[] = CLASS_HIT_DICE.map((face) => ({
  value: String(face),
  label: formatHitDie(face),
}))

const armorCategoryOptions = toOptions(
  ARMOR_CATEGORIES,
  Object.fromEntries(ARMOR_CATEGORIES.map((c) => [c, ARMOR_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof ARMOR_CATEGORIES)[number],
    string
  >,
)

const weaponCategoryOptions = toOptions(
  WEAPON_CATEGORIES,
  Object.fromEntries(WEAPON_CATEGORIES.map((c) => [c, WEAPON_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof WEAPON_CATEGORIES)[number],
    string
  >,
)

const PROFICIENCY_BONUS_OPTIONS: FieldOption[] = [
  { value: '0', label: 'None' },
  { value: '1', label: '+1' },
  { value: '2', label: '+2' },
]

export const levelZeroArmorProficienciesFormSchema = z.object({
  categories: z.array(z.string()),
  items: z.array(z.string()),
})

export const levelZeroWeaponProficienciesFormSchema = z.object({
  categories: z.array(z.string()),
  items: z.array(z.string()),
})

export const levelZeroLanguageProficienciesFormSchema = z.object({
  items: z.array(z.string()),
})

export const levelZeroNpcsFormSchema = z.object({
  levelZeroNpcsEnabled: z.boolean(),
  levelZeroBaseHitDie: z.coerce.number().pipe(hitDieSchema),
  levelZeroProficiencyBonus: z.coerce.number().pipe(levelZeroProficiencyBonusSchema),
  levelZeroRetainSpeciesTraits: z.boolean(),
  levelZeroArmorGrantMode: z.enum(XOR_GRANT_SET_MODES),
  levelZeroArmorProficiencies: levelZeroArmorProficienciesFormSchema,
  levelZeroWeaponGrantMode: z.enum(XOR_GRANT_SET_MODES),
  levelZeroWeaponProficiencies: levelZeroWeaponProficienciesFormSchema,
  levelZeroLanguageProficiencies: levelZeroLanguageProficienciesFormSchema,
  levelZeroRetainSpeciesLanguages: z.boolean(),
  levelZeroStartingWealth: z
    .object({
      amount: z.coerce.number().min(0),
      currency: z.enum(['cp', 'sp', 'gp', 'pp']),
    })
    .optional(),
  levelZeroStandardArray: z.array(z.coerce.number().int()).length(6),
})

export type LevelZeroNpcsFormValues = z.infer<typeof levelZeroNpcsFormSchema> & {
  levelZeroBaseHitDie: z.infer<typeof hitDieSchema>
  levelZeroProficiencyBonus: z.infer<typeof levelZeroProficiencyBonusSchema>
  levelZeroStartingWealth?: WealthGrantMoneyForm
}

export type LevelZeroNpcsFieldOptions = {
  languageOptions: FieldOption[]
  armorOptions: FieldOption[]
  weaponOptions: FieldOption[]
}

/** Level 0 NPC campaign configuration fields — uses shared language and XOR grant factories. */
export function levelZeroNpcsFields({
  languageOptions,
  armorOptions,
  weaponOptions,
}: LevelZeroNpcsFieldOptions): FormItem[] {
  return [
    {
      kind: 'group',
      legend: 'Level 0 NPCs',
      description: 'Baseline stats and proficiencies for classless Level 0 NPCs.',
      fields: [
        {
          kind: 'dependent',
          controller: {
            type: 'switch',
            name: LEVEL_ZERO_NPCS_ENABLED,
            label: 'Allow',
            hint: 'Enable level 0 NPC configuration for this campaign.',
            defaultValue: true,
          },
          dependents: {
            chrome: 'inset',
            fields: [
              standardArrayFormFields({
                name: 'levelZeroStandardArray',
                label: 'Standard array',
                hint: 'Sets the six fixed ability scores used when generating Level 0 NPCs.',
              }),
              {
                kind: 'row',
                fields: [
                  {
                    type: 'select',
                    name: 'levelZeroBaseHitDie',
                    label: 'Base hit die',
                    hint: 'Hit die used for level 0 NPC hit points.',
                    options: hitDieOptions,
                    width: '1/2',
                    digits: 3,
                  },
                  {
                    type: 'select',
                    name: 'levelZeroProficiencyBonus',
                    label: 'Proficiency bonus',
                    hint: 'Proficiency bonus applied to level 0 NPCs.',
                    options: PROFICIENCY_BONUS_OPTIONS,
                    width: '1/2',
                    digits: 4,
                  },
                ],
              },
              {
                type: 'switch',
                name: 'levelZeroRetainSpeciesTraits',
                label: 'Species traits',
                hint: 'Grant traits from the NPC species.',
                defaultValue: true,
                separator: 'subtle',
              },
              xorProficiencyGrantSetField({
                modeFieldName: LEVEL_ZERO_ARMOR_MODE,
                categoriesPath: LEVEL_ZERO_ARMOR_CATEGORIES_PATH,
                itemsPath: LEVEL_ZERO_ARMOR_ITEMS_PATH,
                label: 'Armor proficiencies',
                hint: 'Armor training granted to every level 0 NPC.',
                categoryOptions: armorCategoryOptions,
                itemOptions: armorOptions,
                categoriesLabel: 'Armor categories',
                itemsLabel: 'Specific armor',
                separator: 'subtle',
              }),
              xorProficiencyGrantSetField({
                modeFieldName: LEVEL_ZERO_WEAPON_MODE,
                categoriesPath: LEVEL_ZERO_WEAPON_CATEGORIES_PATH,
                itemsPath: LEVEL_ZERO_WEAPON_ITEMS_PATH,
                label: 'Weapon proficiencies',
                hint: 'Weapon training granted to every level 0 NPC.',
                categoryOptions: weaponCategoryOptions,
                itemOptions: weaponOptions,
                categoriesLabel: 'Weapon categories',
                itemsLabel: 'Specific weapons',
                separator: 'subtle',
              }),
              languageGrantItemsField({
                path: LEVEL_ZERO_LANGUAGE_ITEMS_PATH,
                label: 'Shared languages',
                hint: '',
                introText: 'Every level 0 NPC receives these languages:',
                languageOptions,
                separator: 'subtle',
              }),
              {
                type: 'switch',
                name: 'levelZeroRetainSpeciesLanguages',
                label: 'Species languages',
                hint: "Grant languages from the NPC's species language affinities.",
                defaultValue: true,
                separator: 'subtle',
              },
              ...wealthGrantMoneyField(LEVEL_ZERO_STARTING_WEALTH_PATH),
            ],
          },
        },
      ],
    },
  ]
}

export type { XorGrantSetMode }
