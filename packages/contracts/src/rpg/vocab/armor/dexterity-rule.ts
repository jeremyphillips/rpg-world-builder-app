import { formatSignedModifier } from '../../primitives/signed-modifier'
import { armorClassDelta, type ArmorClassRules } from '../mechanics/armor-class-scale'
import type { ArmorCategory } from './category'

/** How a body-armor category applies the wearer's DEX modifier. Shields are outside this rule. */
export type ArmorDexterityRule =
  | { mode: 'full' }
  | { mode: 'capped'; maxBonus: number }
  | { mode: 'none' }

const MEDIUM_ARMOR_MAX_DEX_BONUS = 2

/** Category default for body armor. Light adds full DEX, medium caps at +2, and heavy adds none. */
export function resolveArmorDexterityRule(
  category: Exclude<ArmorCategory, 'shields'>,
): ArmorDexterityRule {
  switch (category) {
    case 'light':
      return { mode: 'full' }
    case 'medium':
      return { mode: 'capped', maxBonus: MEDIUM_ARMOR_MAX_DEX_BONUS }
    case 'heavy':
      return { mode: 'none' }
  }
}

/** Base AC hint for a body-armor category. The cap is a protection magnitude. */
export function formatArmorDexterityRuleHint(
  rule: ArmorDexterityRule,
  rules: ArmorClassRules,
): string {
  const lowers = armorClassDelta(rules, 1) < 0
  switch (rule.mode) {
    case 'full':
      return lowers ? 'Subtracts the full DEX modifier.' : 'Adds the full DEX modifier.'
    case 'capped': {
      const cap = formatSignedModifier(armorClassDelta(rules, rule.maxBonus))
      return lowers
        ? `Subtracts the DEX modifier, up to ${cap}.`
        : `Adds the DEX modifier, up to ${cap}.`
    }
    case 'none':
      return 'DEX modifier does not apply.'
  }
}

/**
 * Hint for a field that stays a positive protection magnitude.
 * Enhancement adjustments may be negative; that hint talks about a positive value.
 */
export function formatArmorClassContributionHint(
  rules: ArmorClassRules,
  contribution: 'unarmored' | 'shield' | 'enhancement',
): string {
  const lowers = armorClassDelta(rules, 1) < 0
  if (contribution === 'unarmored') {
    return lowers
      ? 'Lowers unarmored Armor Class by this amount.'
      : 'Raises unarmored Armor Class by this amount.'
  }
  if (contribution === 'shield') {
    return lowers ? 'Lowers Armor Class by this amount.' : 'Raises Armor Class by this amount.'
  }
  return lowers
    ? 'A positive enhancement lowers Armor Class.'
    : 'A positive enhancement raises Armor Class.'
}
