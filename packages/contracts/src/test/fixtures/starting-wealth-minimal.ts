import type { StartingWealthRules } from '../../rpg/campaign/rules/starting-wealth'
import { MAX_CHARACTER_LEVEL } from '../../rpg/primitives/level'
import { withLastTierMaxLevel } from '../helpers/patch-tier'

/** Synthetic tier ids for contracts tests — never catalog ids. */
export const MINIMAL_TIER_A_ID = 'tier-a'
export const MINIMAL_TIER_B_ID = 'tier-b'
export const MINIMAL_TIER_C_ID = 'tier-c'

/** Minimal starting wealth seed (3 tiers) for campaign ruleset unit tests. */
export const minimalStartingWealthSeed: StartingWealthRules = {
  name: 'Standard Starting Wealth',
  scope: { kind: 'standard' },
  tiers: [
    {
      id: MINIMAL_TIER_A_ID,
      label: 'Level 1',
      minLevel: 1,
      maxLevel: 1,
      includeNormalStartingEquipment: true,
      magicItemGrants: [],
    },
    {
      id: MINIMAL_TIER_B_ID,
      label: 'Levels 2–4',
      minLevel: 2,
      maxLevel: 4,
      includeNormalStartingEquipment: true,
      magicItemGrants: [{ rarity: 'common', quantity: 1 }],
    },
    {
      id: MINIMAL_TIER_C_ID,
      label: 'Levels 5–10',
      minLevel: 5,
      maxLevel: 10,
      includeNormalStartingEquipment: true,
      bonusGold: {
        baseGp: 500,
        formula: {
          kind: 'dice',
          dice: { count: 1, faces: 10 },
          multiplier: 25,
          currency: 'gp',
        },
      },
      magicItemGrants: [
        { rarity: 'common', quantity: 1 },
        { rarity: 'uncommon', quantity: 1 },
      ],
    },
  ],
}

/** Minimal seed with last tier extended to the standard campaign max (1–20). */
export const minimalStartingWealthSeedCoveringStandardMax: StartingWealthRules = {
  ...minimalStartingWealthSeed,
  tiers: withLastTierMaxLevel(minimalStartingWealthSeed, MAX_CHARACTER_LEVEL),
}
