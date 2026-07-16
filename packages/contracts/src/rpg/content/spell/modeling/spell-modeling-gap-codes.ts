import { MODELING_GAP_CODES } from '../../../primitives/modeling/gap-codes'
import { SPELL_RESOLUTION_APPLICATION_GAP_CODES } from './spell-resolution-application-gap-codes'
import { SPELL_RESOLUTION_ENVIRONMENT_GAP_CODES } from './spell-resolution-environment-gap-codes'
import { SPELL_RESOLUTION_TARGETING_GAP_CODES } from './spell-resolution-targeting-gap-codes'

/** Unified spell modeling gap vocabulary — domain-neutral codes plus spell-resolution codes. */
export const SPELL_MODELING_GAP_CODES = {
  ...MODELING_GAP_CODES,
  ...SPELL_RESOLUTION_TARGETING_GAP_CODES,
  ...SPELL_RESOLUTION_APPLICATION_GAP_CODES,
  ...SPELL_RESOLUTION_ENVIRONMENT_GAP_CODES,
} as const

export type SpellModelingGapCode = keyof typeof SPELL_MODELING_GAP_CODES

export function isSpellModelingGapCode(code: string): code is SpellModelingGapCode {
  return code in SPELL_MODELING_GAP_CODES
}

export function getSpellModelingGapLabel(code: SpellModelingGapCode): string {
  return SPELL_MODELING_GAP_CODES[code]
}
