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

/** Base AC hint for a body-armor category. */
export function formatArmorDexterityRuleHint(rule: ArmorDexterityRule): string {
  switch (rule.mode) {
    case 'full':
      return 'Adds the full DEX modifier.'
    case 'capped':
      return `Adds the DEX modifier, up to +${rule.maxBonus}.`
    case 'none':
      return 'DEX modifier does not apply.'
  }
}
