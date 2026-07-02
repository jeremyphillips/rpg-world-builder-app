import { z } from 'zod'
import {
  MAGIC_ITEM_RARITIES,
  MAGIC_ITEM_RARITY_ENTRIES,
  absoluteLevelSchema,
  currencySchema,
  getCurrencyAbbrev,
  magicItemRaritySchema,
} from '@rpg/contracts'
import { DIE_FACES } from '@rpg/contracts/primitives'
import { toOptions, type FormItem } from '@rpg/ui/form'

import { buildLevelRangeTiersArrayField } from '../../forms/fields/level-range-table-form-fields'

import {
  formatStartingWealthTierSummary,
  STARTING_WEALTH_CURRENCY_OPTIONS,
  STARTING_WEALTH_FORM_PREFIX,
  STARTING_WEALTH_TIER_COUNT,
  type StartingWealthTierFormValues,
} from './starting-wealth-form-values'

const BONUS_GOLD_ENABLED = 'bonusGoldEnabled'

const magicItemRarityOptions = toOptions(
  MAGIC_ITEM_RARITIES,
  Object.fromEntries(
    MAGIC_ITEM_RARITIES.map((rarity) => [rarity, MAGIC_ITEM_RARITY_ENTRIES[rarity].label]),
  ) as Record<(typeof MAGIC_ITEM_RARITIES)[number], string>,
)

const diceFormulaModifierSchema = z.object({
  operator: z.enum(['+', '-', '×', '÷']),
  amount: z.number().int(),
})

const diceFormulaValueSchema = z.object({
  count: z.number().int().min(1),
  faces: z.number().int().min(1),
  modifier: diceFormulaModifierSchema.optional(),
})

const startingWealthMagicItemGrantFormSchema = z.object({
  rarity: magicItemRaritySchema,
  quantity: z.number().int().min(1),
})

const startingWealthTierBonusGoldFormSchema = z.object({
  baseGp: z.number().int().min(0),
  /** Form-only unit label backing for the Base inputSelect; always GP. */
  baseCurrency: z.literal('gp').optional(),
  formula: diceFormulaValueSchema,
  currency: currencySchema,
})

export const startingWealthTierFormSchema = z
  .object({
    label: z.string().min(1),
    minLevel: absoluteLevelSchema,
    maxLevel: absoluteLevelSchema,
    includeNormalStartingEquipment: z.boolean(),
    bonusGoldEnabled: z.boolean(),
    bonusGold: startingWealthTierBonusGoldFormSchema,
    magicItemGrants: z.array(startingWealthMagicItemGrantFormSchema),
  })
  .superRefine((tier, ctx) => {
    if (tier.bonusGoldEnabled && tier.bonusGold.formula.modifier?.operator !== '×') {
      ctx.addIssue({
        code: 'custom',
        message: 'Bonus gold rolls must use a multiplier (×)',
        path: ['bonusGold', 'formula'],
      })
    }
  })

export const startingWealthFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  tiers: z.array(startingWealthTierFormSchema).length(STARTING_WEALTH_TIER_COUNT),
})

/** Fixed-length tier array editor for `startingWealth.tiers`. */
export function buildStartingWealthTiersField(): FormItem {
  return buildLevelRangeTiersArrayField({
    name: 'tiers',
    legend: 'Wealth tiers',
    min: STARTING_WEALTH_TIER_COUNT,
    max: STARTING_WEALTH_TIER_COUNT,
    rhythm: 'comfortable',
    itemVariant: 'detailed',
    itemCollapsible: true,
    itemHeader: {
      primaryField: 'label',
      fallback: (index) => `Wealth tier #${index + 1}`,
      summary: (values) => formatStartingWealthTierSummary(values as StartingWealthTierFormValues),
    },
    fields: [
      {
        type: 'text',
        name: 'label',
        label: 'Tier label',
        required: true,
        width: 'full',
      },
      {
        type: 'switch',
        name: 'includeNormalStartingEquipment',
        label: 'Include class starting equipment',
        hint: 'Adds equipment from Class → Character Creation in addition to this starting wealth.',
        defaultValue: true,
      },
      {
        kind: 'stack',
        layout: 'dependent',
        dependentsChrome: 'subtle',
        fields: [
          {
            type: 'switch',
            name: BONUS_GOLD_ENABLED,
            label: 'Bonus gold',
            defaultValue: false,
          },
          {
            type: 'inputSelect',
            name: 'bonusGold',
            label: 'Base',
            inputType: 'number',
            valueKey: 'baseGp',
            unitKey: 'baseCurrency',
            fixedUnit: getCurrencyAbbrev('gp'),
            unitValue: 'gp',
            min: 0,
            required: true,
            width: 'md',
            formatGrouped: true,
            defaultValue: { baseGp: 0, baseCurrency: 'gp' },
          },
          {
            type: 'diceFormula',
            name: 'bonusGold.formula',
            label: 'Bonus roll',
            modifierMode: 'required',
            modifierOperators: ['×'],
            modifierMin: 1,
            modifierMax: 9999,
            modifierAmountLabel: 'Multiplier',
            faces: DIE_FACES,
            currencyUnit: {
              name: 'bonusGold.currency',
              options: STARTING_WEALTH_CURRENCY_OPTIONS,
              defaultValue: 'gp',
            },
          },
        ],
      },
      {
        kind: 'array',
        name: 'magicItemGrants',
        legend: 'Magic item grants',
        addLabel: 'Add magic item grant',
        min: 0,
        itemVariant: 'compact',
        itemHeader: {
          fallback: (index) => `Grant #${index + 1}`,
          srOnly: true,
        },
        fields: [
          {
            kind: 'row',
            fields: [
              {
                type: 'select',
                name: 'rarity',
                label: 'Rarity',
                options: magicItemRarityOptions,
                required: true,
                width: 'lg',
              },
              {
                type: 'number',
                name: 'quantity',
                label: 'Quantity',
                min: 1,
                required: true,
                digits: 2,
                width: 'auto',
              },
            ],
          },
        ],
      },
    ],
  })
}

export { STARTING_WEALTH_FORM_PREFIX }
