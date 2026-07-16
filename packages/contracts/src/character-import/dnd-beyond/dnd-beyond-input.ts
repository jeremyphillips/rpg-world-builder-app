const DND_BEYOND_CHARACTER_URL_PATTERN = /dndbeyond\.com\/(?:profile\/\d+\/)?characters\/(\d+)/i

export const DND_BEYOND_CHARACTER_SERVICE_BASE_URL =
  'https://character-service.dndbeyond.com/character/v5/character'

/** Normalize a numeric id or supported public character URL to a D&D Beyond character id. */
export function normalizeDndBeyondCharacterInput(input: string): string {
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) {
    return trimmed
  }

  const match = trimmed.match(DND_BEYOND_CHARACTER_URL_PATTERN)
  if (match?.[1]) {
    return match[1]
  }

  throw new Error('Enter a numeric character ID or a supported D&D Beyond character URL.')
}

export function buildDndBeyondCharacterUrl(characterId: string): string {
  return `${DND_BEYOND_CHARACTER_SERVICE_BASE_URL}/${characterId}`
}

export function buildDndBeyondReadonlyUrl(characterId: string): string {
  return `https://www.dndbeyond.com/characters/${characterId}`
}
