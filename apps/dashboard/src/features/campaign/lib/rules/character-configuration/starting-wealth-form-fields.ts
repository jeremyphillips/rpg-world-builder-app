import { z } from 'zod'
import {
  MAGIC_ITEM_RARITIES,
  MAGIC_ITEM_RARITY_ENTRIES,
  absoluteLevelSchema,
  currencySchema,
  defineMessage,
  getCurrencyAbbrev,
  magicItemRaritySchema,
  requiredWhenCopy,
  singularizeLabel,
} from '@rpg/contracts'
import { DIE_FACES } from '@rpg/contracts/primitives'
import { toOptions } from '@rpg/ui/form'

import { buildLevelRangeTiersArrayField } from '../../forms/level-range-table-form-fields'
import type { LevelRangeArrayConfig } from '../../forms/array-patterns'

import {
  formatStartingWealthTierSummary,
  STARTING_WEALTH_CURRENCY_OPTIONS,
  STARTING_WEALTH_FORM_PREFIX,
  STARTING_WEALTH_TIER_COUNT,
  type StartingWealthTierFormValues,
} from './starting-wealth-form-values'

const BONUS_GOLD_ENABLED = 'bonusGoldEnabled'

const STARTING_WEALTH_TIERS_LEGEND = 'Wealth tiers' as const
const startingWealthTierItemLabel = singularizeLabel(STARTING_WEALTH_TIERS_LEGEND)

/** Starting-wealth form validation messages (tier 3 form overrides). */
export const startingWealthValidationMessages = {
  bonusGoldRequired: defineMessage('validation.startingWealth.bonusGoldRequired', () =>
    requiredWhenCopy('Additional gold details', 'additional gold is enabled'),
  ),
  bonusGoldMultiplier: defineMessage(
    'validation.startingWealth.bonusGoldMultiplier',
    () => 'Additional gold rolls must use a multiplier (×).',
  ),
}

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
    bonusGold: startingWealthTierBonusGoldFormSchema.optional(),
    magicItemGrants: z.array(startingWealthMagicItemGrantFormSchema),
  })
  .superRefine((tier, ctx) => {
    if (!tier.bonusGoldEnabled) return

    if (!tier.bonusGold) {
      ctx.addIssue({
        code: 'custom',
        message: startingWealthValidationMessages.bonusGoldRequired(),
        path: ['bonusGold'],
      })
      return
    }

    if (tier.bonusGold.formula.modifier?.operator !== '×') {
      ctx.addIssue({
        code: 'custom',
        message: startingWealthValidationMessages.bonusGoldMultiplier(),
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
export function buildStartingWealthTiersField(): LevelRangeArrayConfig {
  return buildLevelRangeTiersArrayField({
    name: 'tiers',
    legend: STARTING_WEALTH_TIERS_LEGEND,
    min: STARTING_WEALTH_TIER_COUNT,
    max: STARTING_WEALTH_TIER_COUNT,
    density: 'comfortable',
    itemVariant: 'detailed',
    itemSurface: { emphasis: 'subtle' },
    itemCollapsible: true,
    itemHeader: {
      primaryField: 'label',
      fallback: (index) => `${startingWealthTierItemLabel} #${index + 1}`,
      formatPrimary: (value) => `${startingWealthTierItemLabel} — ${String(value)}`,
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
        label: 'Include selected class starting option',
        hint: "Includes the selected class option's equipment and baseline wealth, then adds this tier's gold and magic-item grants.",
        defaultValue: true,
      },
      {
        kind: 'dependent',
        controller: {
          type: 'switch',
          name: BONUS_GOLD_ENABLED,
          label: 'Additional gold',
          hint: "Added to the selected class option's baseline wealth.",
          defaultValue: false,
        },
        dependents: {
          chrome: 'panel',
          panel: { surface: { emphasis: 'default' } },
          fields: [
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
              label: 'Additional roll',
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
      },
      {
        kind: 'array',
        name: 'magicItemGrants',
        legend: 'Magic item grants',
        addAction: { label: 'Add magic item grant' },
        min: 0,
        item: {
          variant: 'compact',
          surface: { emphasis: 'strong' },
          header: {
            fallback: (index) => `Grant #${index + 1}`,
            srOnly: true,
          },
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
