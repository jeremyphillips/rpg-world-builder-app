import {
  RECHARGE_DIE_FACES,
  RECHARGE_REST_RECOVERY,
  type LimitedUse,
  type UseCount,
} from './schema'
import type { RestRecovery } from '../rest-recovery'

export type LimitedUseDescription = {
  count?: UseCount
  restRecovery: RestRecovery
  rechargeRoll?: { faces: typeof RECHARGE_DIE_FACES; minRoll: number }
}

/** The only interpreter of a limited-use value. Formatters and future runtime read this. */
export function describeLimitedUse(use: LimitedUse): LimitedUseDescription {
  if (use.kind === 'recharge') {
    return {
      restRecovery: RECHARGE_REST_RECOVERY,
      rechargeRoll: { faces: RECHARGE_DIE_FACES, minRoll: use.minRoll },
    }
  }

  return {
    count: use.count,
    restRecovery: use.recovery,
  }
}
