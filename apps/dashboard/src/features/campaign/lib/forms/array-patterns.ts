import type { ArrayConfig, ArrayPatternConfig } from '@rpg/ui/form'

export {
  levelRangeArrayPattern,
  resolveLevelRangeErrorFocusTarget,
} from './level-range-array-pattern'

/** Domain repeatable-field templates — not imported by `@rpg/ui/form`. */
export type DashboardArrayPattern = ArrayPatternConfig

export type LevelRangeArrayConfig = ArrayConfig & {
  arrayPattern: ArrayPatternConfig & { kind: 'levelRange' }
  reorder: false
}
