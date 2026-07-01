import type { ArrayConfig } from '@rpg/ui/form'

/** Domain repeatable-field templates — not imported by `@rpg/ui/form`. */
export type DashboardArrayPattern =
  | { kind: 'levelRange'; levelKeys?: { min: string; max: string } }
  | { kind: 'grantSelection'; selectionKey?: string }

export type LevelRangeArrayConfig = ArrayConfig & {
  arrayPattern: { kind: 'levelRange'; levelKeys?: { min: string; max: string } }
  allowReorder: false
}
