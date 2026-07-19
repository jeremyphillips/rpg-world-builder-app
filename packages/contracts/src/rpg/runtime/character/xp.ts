import { xpRequiredForLevel, type XpProgressionBody } from '../../content/xp-progression'
import type { Character } from './sheet'
import { getCharacterTotalLevel } from './sheet'

// ---------------------------------------------------------------------------
// Character XP — level threshold lookup over authored progression tables.
// ---------------------------------------------------------------------------

/** Minimum XP required to be at the given character level (level 1 → 0). */
export function resolveXpRequiredForLevel(
  level: number,
  progression: Pick<XpProgressionBody, 'entries'>,
): number | undefined {
  return xpRequiredForLevel(progression, level)
}

/** Stored XP on a character sheet (formatting is a UI concern). */
export function resolveCharacterXpDisplay(
  character: Pick<Character, 'xp'>,
  _progression: Pick<XpProgressionBody, 'entries'>,
): number {
  return character.xp
}

/** XP floor for a character's current total level under the given progression. */
export function resolveCharacterXpFloor(
  character: Pick<Character, 'classes'>,
  progression: Pick<XpProgressionBody, 'entries'>,
): number | undefined {
  return resolveXpRequiredForLevel(getCharacterTotalLevel(character), progression)
}
