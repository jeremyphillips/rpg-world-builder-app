import type { MonsterFormValues } from './monster-form-values'

export type MonsterArmorClassKind = MonsterFormValues['armorClass']['kind']

export type MonsterArmorClassStash = {
  natural?: number
  fixed?: number
}

export type MonsterHitPointStash = {
  hitDice?: number
  fixed?: { average?: number; formula?: string }
}

export type MonsterVariantStash = {
  armorClass: MonsterArmorClassStash
  hitPoints: MonsterHitPointStash
}

export const EMPTY_MONSTER_VARIANT_STASH: MonsterVariantStash = {
  armorClass: {},
  hitPoints: {},
}

type ArmorClassValue = MonsterFormValues['armorClass']
type HitPointsValue = MonsterFormValues['hitPoints']

function rememberArmorClass(
  current: ArmorClassValue,
  stash: MonsterArmorClassStash,
): MonsterArmorClassStash {
  if (current.kind === 'natural' && current.bonus !== undefined) {
    return { ...stash, natural: current.bonus }
  }
  if (current.kind === 'fixed' && current.value !== undefined) {
    return { ...stash, fixed: current.value }
  }
  return stash
}

/** Applies the AC source transition table. Equipment rows are never edited here. */
export function transitionArmorClass(
  current: ArmorClassValue,
  nextKind: MonsterArmorClassKind,
  stash: MonsterArmorClassStash,
  calculatedAc?: number,
): { armorClass: ArmorClassValue; stash: MonsterArmorClassStash } {
  const nextStash = rememberArmorClass(current, stash)
  if (nextKind === 'natural') {
    return {
      armorClass: { kind: 'natural', bonus: nextStash.natural ?? 1 },
      stash: nextStash,
    }
  }
  if (nextKind === 'fixed') {
    const value = nextStash.fixed ?? calculatedAc
    return {
      armorClass: value === undefined ? { kind: 'fixed' } : { kind: 'fixed', value },
      stash: nextStash,
    }
  }
  if (nextKind === 'equipment') {
    return { armorClass: { kind: 'equipment' }, stash: nextStash }
  }
  return { armorClass: { kind: 'unarmored' }, stash: nextStash }
}

function rememberHitPoints(
  current: HitPointsValue,
  stash: MonsterHitPointStash,
): MonsterHitPointStash {
  if (current.kind === 'hit-dice') {
    return { ...stash, hitDice: current.count }
  }
  return {
    ...stash,
    fixed: { average: current.average, formula: current.formula },
  }
}

/** Switches HP mode. Size changes do not call this — they only change the displayed die. */
export function transitionHitPoints(
  current: HitPointsValue,
  nextKind: HitPointsValue['kind'],
  stash: MonsterHitPointStash,
  prefill?: { average?: number; formula?: string },
): { hitPoints: HitPointsValue; stash: MonsterHitPointStash } {
  const nextStash = rememberHitPoints(current, stash)
  if (nextKind === 'hit-dice') {
    return {
      hitPoints: { kind: 'hit-dice', count: nextStash.hitDice ?? 1 },
      stash: nextStash,
    }
  }
  const average = nextStash.fixed?.average ?? prefill?.average
  const formula = nextStash.fixed?.formula || prefill?.formula
  return {
    hitPoints: {
      kind: 'fixed',
      ...(average !== undefined ? { average } : {}),
      ...(formula ? { formula } : {}),
    },
    stash: nextStash,
  }
}
