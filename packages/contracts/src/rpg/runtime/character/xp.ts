import { xpRequiredForLevel, type XpProgressionBody } from '../../content/xp-progression'
import type { Character } from './sheet'
import { getCharacterTotalLevel } from './sheet'

// ---------------------------------------------------------------------------
// Character XP — level threshold lookup and mutation eligibility.
// ---------------------------------------------------------------------------

/** Minimum XP required to be at the given character level (level 1 → 0). */
export function resolveXpRequiredForLevel(
  level: number,
  progression: Pick<XpProgressionBody, 'entries'>,
): number | undefined {
  return xpRequiredForLevel(progression, level)
}

/** Stored XP on a character sheet. null = not tracked / not initialized. */
export function resolveCharacterXpDisplay(
  character: Pick<Character, 'xp'>,
  _progression: Pick<XpProgressionBody, 'entries'>,
): number | null {
  return character.xp
}

/** XP floor for a character's current total level under the given progression. */
export function resolveCharacterXpFloor(
  character: Pick<Character, 'classes'>,
  progression: Pick<XpProgressionBody, 'entries'>,
): number | undefined {
  return resolveXpRequiredForLevel(getCharacterTotalLevel(character), progression)
}

/** Level 0 characters cannot gain XP — domain invariant, not a campaign setting. */
export function canCharacterGainXp(character: Pick<Character, 'classes'>): boolean {
  return getCharacterTotalLevel(character) > 0
}

export class CharacterXpMutationError extends Error {
  constructor(message = 'Level 0 characters cannot gain experience points.') {
    super(message)
    this.name = 'CharacterXpMutationError'
  }
}

/** Rejects XP mutation for classless Level 0 characters. */
export function assertCharacterXpMutationAllowed(
  character: Pick<Character, 'classes' | 'xp'>,
  nextXp: number | null,
): void {
  if (nextXp === null) return
  if (canCharacterGainXp(character)) return
  if (nextXp > 0) {
    throw new CharacterXpMutationError()
  }
}
