import { DEFAULT_EPIC_BADGE_COLOR } from '@rpg/contracts/dev-bench'

/** Picks black or white label text for a `#RRGGBB` background. */
export function badgeTextColorForBackground(hex: string): '#000000' | '#ffffff' {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255
  return luminance > 0.6 ? '#000000' : '#ffffff'
}

export function epicBadgeBackgroundColor(badgeColor: string | undefined): string {
  return badgeColor ?? DEFAULT_EPIC_BADGE_COLOR
}
