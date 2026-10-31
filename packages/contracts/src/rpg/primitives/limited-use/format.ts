import type { RestKind } from '../../vocab/rest'
import { describeLimitedUse } from './describe'
import {
  RECHARGE_DIE_FACES,
  type LimitedUse,
  type RestLimitedUse,
  type UseCountKind,
} from './schema'

export const LIMITED_USE_NOTATION_STYLES = ['stat-block', 'feature'] as const
export type LimitedUseNotationStyle = (typeof LIMITED_USE_NOTATION_STYLES)[number]

type NotationCell = (count: number) => string

export const LIMITED_USE_NOTATION = {
  fixed: {
    short: {
      'stat-block': (count) =>
        count === 1 ? 'Recharges after a Short or Long Rest' : `${count}/Short Rest`,
      feature: (count) => `${count}/Short Rest`,
    },
    long: {
      'stat-block': (count) => `${count}/Day`,
      feature: (count) => `${count}/Long Rest`,
    },
  },
  'proficiency-bonus': {
    short: {
      'stat-block': (_count: number) => 'Proficiency Bonus/Short Rest',
      feature: (_count: number) => 'Proficiency Bonus/Short Rest',
    },
    long: {
      'stat-block': (_count: number) => 'Proficiency Bonus/Long Rest',
      feature: (_count: number) => 'Proficiency Bonus/Long Rest',
    },
  },
} as const satisfies Record<
  UseCountKind,
  Record<RestKind, Record<LimitedUseNotationStyle, NotationCell>>
>

function formatRechargeRoll(minRoll: number): string {
  if (minRoll >= RECHARGE_DIE_FACES) return `Recharge ${RECHARGE_DIE_FACES}`
  return `Recharge ${minRoll}–${RECHARGE_DIE_FACES}`
}

export const RECHARGE_NOTATION = {
  'stat-block': formatRechargeRoll,
  feature: formatRechargeRoll,
} as const satisfies Record<LimitedUseNotationStyle, (minRoll: number) => string>

export function formatLimitedUseNotation(use: LimitedUse, style: LimitedUseNotationStyle): string {
  const described = describeLimitedUse(use)
  if (described.rechargeRoll) {
    return RECHARGE_NOTATION[style](described.rechargeRoll.minRoll)
  }

  const count = described.count
  if (!count) return ''
  const rest = described.restRecovery.minimumRest
  if (count.kind === 'proficiency-bonus') {
    return LIMITED_USE_NOTATION['proficiency-bonus'][rest][style](0)
  }
  return LIMITED_USE_NOTATION.fixed[rest][style](count.value)
}

type SentenceCell = (count: number) => string

export const LIMITED_USE_SENTENCES = {
  fixed: {
    short: (count) =>
      count === 1 ? 'once per short or long rest' : `${count} times per short or long rest`,
    long: (count) => (count === 1 ? 'once per long rest' : `${count} times per long rest`),
  },
  'proficiency-bonus': {
    short: (_count: number) => 'proficiency bonus times per short or long rest',
    long: (_count: number) => 'proficiency bonus times per long rest',
  },
} as const satisfies Record<UseCountKind, Record<RestKind, SentenceCell>>

/** Sentence form for an absent limit or a rest-based uses limit. Recharge is not accepted. */
export function formatLimitedUseSentence(use?: RestLimitedUse): string {
  if (!use) return 'at will'
  const described = describeLimitedUse(use)
  const count = described.count
  if (!count) return 'at will'
  const rest = described.restRecovery.minimumRest
  if (count.kind === 'proficiency-bonus') {
    return LIMITED_USE_SENTENCES['proficiency-bonus'][rest](0)
  }
  return LIMITED_USE_SENTENCES.fixed[rest](count.value)
}
