export const ARMOR_CLASS_MODES = ['ascending', 'descending'] as const

export type ArmorClassMode = (typeof ARMOR_CLASS_MODES)[number]

export const ARMOR_CLASS_BASES = [9, 10] as const

export type ArmorClassBase = (typeof ARMOR_CLASS_BASES)[number]

export type ArmorClassRules = {
  readonly mode: ArmorClassMode
  readonly base: ArmorClassBase
}

/** Body-armor protection stored on the item. Context-free. */
export const BASE_AC_OFFSET_RANGE = { min: 0, max: 15 } as const

/** Fixed AC (monster override, vehicle) may sit below unarmored. No maximum. */
export const FIXED_AC_OFFSET_MIN = -10

/** Base 10 and 9, each ascending and descending. Formula tests use every entry. */
export const ARMOR_CLASS_RULES_MATRIX = [
  { mode: 'ascending', base: 10 },
  { mode: 'ascending', base: 9 },
  { mode: 'descending', base: 10 },
  { mode: 'descending', base: 9 },
] as const satisfies readonly ArmorClassRules[]

function armorClassDirectionSign(mode: ArmorClassMode): 1 | -1 {
  return mode === 'ascending' ? 1 : -1
}

function applySign(mode: ArmorClassMode, magnitude: number): number {
  const signed = armorClassDirectionSign(mode) * magnitude
  return signed === 0 ? 0 : signed
}

/** Effective AC for a protection magnitude. */
export function armorClassFromProtection(rules: ArmorClassRules, protection: number): number {
  return rules.base + applySign(rules.mode, protection)
}

/** Protection magnitude for an effective AC. Exact inverse of {@link armorClassFromProtection}. */
export function protectionFromArmorClass(rules: ArmorClassRules, armorClass: number): number {
  return applySign(rules.mode, armorClass - rules.base)
}

/** Signed change in effective AC for a protection delta. */
export function armorClassDelta(rules: ArmorClassRules, protectionDelta: number): number {
  return applySign(rules.mode, protectionDelta)
}

/**
 * Display bounds for a protection range. Descending swaps the ends.
 * An omitted protection end stays omitted.
 */
export function armorClassBoundsForProtection(
  rules: ArmorClassRules,
  bounds: { min?: number; max?: number },
): { min?: number; max?: number } {
  const fromMin = bounds.min === undefined ? undefined : armorClassFromProtection(rules, bounds.min)
  const fromMax = bounds.max === undefined ? undefined : armorClassFromProtection(rules, bounds.max)
  if (armorClassDirectionSign(rules.mode) === 1) {
    return {
      ...(fromMin !== undefined ? { min: fromMin } : {}),
      ...(fromMax !== undefined ? { max: fromMax } : {}),
    }
  }
  return {
    ...(fromMax !== undefined ? { min: fromMax } : {}),
    ...(fromMin !== undefined ? { max: fromMin } : {}),
  }
}

/** Displayed Base AC range for body armor under these rules. Both ends are closed. */
export function armorBaseAcDisplayBounds(rules: ArmorClassRules): { min: number; max: number } {
  const bounds = armorClassBoundsForProtection(rules, BASE_AC_OFFSET_RANGE)
  return { min: bounds.min ?? rules.base, max: bounds.max ?? rules.base }
}

/** Displayed range for a fixed AC offset. The open end stays undefined. */
export function fixedAcDisplayBounds(rules: ArmorClassRules): { min?: number; max?: number } {
  return armorClassBoundsForProtection(rules, { min: FIXED_AC_OFFSET_MIN })
}

/** Positive when `left` is better protection than `right`. */
export function compareArmorClass(rules: ArmorClassRules, left: number, right: number): number {
  return protectionFromArmorClass(rules, left) - protectionFromArmorClass(rules, right)
}
