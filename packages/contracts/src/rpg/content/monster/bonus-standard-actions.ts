/** Dash, Disengage, and Hide. Order is the stat-block order, not selection order. */
export const BONUS_STANDARD_ACTION_IDS = ['dash', 'disengage', 'hide'] as const

export type BonusStandardActionId = (typeof BONUS_STANDARD_ACTION_IDS)[number]

export const BONUS_ACTION_COMBINATIONS = ['one', 'each'] as const

export type BonusActionCombination = (typeof BONUS_ACTION_COMBINATIONS)[number]

export const LEAP_DISTANCE_DEFAULT = 30
export const LEAP_MOVEMENT_DEFAULT = 10
export const LEAP_DISTANCE_MAX = 300
export const LEAP_MOVEMENT_MAX = 299
export const LEAP_DISTANCE_EXCEEDS_MOVEMENT_MESSAGE = 'Jump distance must exceed movement spent.'
export const TELEPORT_WITHIN_DEFAULT = 10
