import type { MonsterFormValues } from '../monster-form-values'

export type MonsterHitPointStash = {
  hitDice?: number
  fixed?: { average?: number }
}

type HitPointsValue = MonsterFormValues['hitPoints']

function rememberHitPoints(
  current: HitPointsValue,
  stash: MonsterHitPointStash,
): MonsterHitPointStash {
  if (current.kind === 'hit-dice') {
    return { ...stash, hitDice: current.count }
  }
  return {
    ...stash,
    fixed: { average: current.average },
  }
}

/** Switches HP mode. Size changes do not call this — they only change the displayed die. */
export function transitionHitPoints(
  current: HitPointsValue,
  nextKind: HitPointsValue['kind'],
  stash: MonsterHitPointStash,
  prefill?: { average?: number },
): { hitPoints: HitPointsValue; stash: MonsterHitPointStash } {
  const nextStash = rememberHitPoints(current, stash)
  if (nextKind === 'hit-dice') {
    return {
      hitPoints: { kind: 'hit-dice', count: nextStash.hitDice ?? 1 },
      stash: nextStash,
    }
  }
  const average = nextStash.fixed?.average ?? prefill?.average
  return {
    hitPoints: {
      kind: 'fixed',
      ...(average !== undefined ? { average } : {}),
    },
    stash: nextStash,
  }
}
