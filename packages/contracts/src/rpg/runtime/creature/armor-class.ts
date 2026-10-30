import type { ArmorEquipmentKindFields } from '../../content/equipment/armor-variant'
import type { Equipment } from '../../content/equipment'
import {
  resolveArmorDexterityRule,
  type ArmorDexterityRule,
} from '../../vocab/armor/dexterity-rule'
import { getCreatureArmorClassKindLabel } from '../../vocab/creature-armor-class-kind'
import {
  armorClassDelta,
  armorClassFromProtection,
  type ArmorClassRules,
} from '../../vocab/mechanics/armor-class-scale'

export {
  resolveCreatureArmorSlot,
  type CreatureArmorSlot,
} from '../../content/equipment/armor-slot'
import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import type { EquipmentModifier } from '../../content/equipment/instance/modifier'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'

import { resolveEquipmentEntryEffectTotals } from '../../content/equipment/instance/equipment-effect-totals'
import {
  resolvedField,
  unavailableField,
  type DerivedField,
  type DerivedFieldReason,
} from './derived-field'

export type ArmorAcFields = Pick<ArmorEquipmentKindFields, 'category' | 'baseAcOffset' | 'acBonus'>

export type ArmorDexContribution = {
  abilityModifier: number
  appliedModifier: number
  rule: ArmorDexterityRule | { mode: 'none' }
}

export type EquippedArmorPiece = ArmorAcFields & {
  acAdjustment: number
  entryId?: string
  label?: string
  enhancementLabel?: string
}

export type CreatureArmorClassSource = 'unarmored' | 'natural' | 'armor' | 'fixed'

export type CreatureArmorClassAlternative = {
  source: 'natural' | 'unarmored' | 'armor'
  label: string
  ac: number
}

export type CreatureArmorClassRow =
  | { kind: 'ruleset-base'; value: number }
  | { kind: 'armor-base'; entryId: string; label: string; value: number }
  | { kind: 'dex'; value: number; cap?: number }
  | { kind: 'natural'; value: number }
  | { kind: 'shield'; entryId: string; label: string; value: number }
  | {
      kind: 'enhancement'
      target: 'armor' | 'shield'
      entryId: string
      label: string
      value: number
    }
  | { kind: 'fixed'; value: number }

export type CreatureArmorClassResolution = {
  ac: number
  source: CreatureArmorClassSource
  /** Rows that contribute to `ac`. Fixed overrides replace the calculated rows. */
  rows: CreatureArmorClassRow[]
  alternatives: DerivedField<CreatureArmorClassAlternative[]>
  /** Calculated total while a fixed override is active. */
  calculatedAc?: DerivedField<number>
  /** True when another body candidate had the same protection as the winner. */
  tie: boolean
  bodyArmor?: { entryId: string; label: string }
  shield?: { entryId: string; label: string }
  /**
   * Present when equipped body armor caps or ignores DEX. Omitted for light armor,
   * unequipped armor, and fixed overrides.
   */
  dexRestriction?: {
    mode: 'capped' | 'none'
    abilityModifier: number
    appliedModifier: number
    maxBonus?: number
    /** Natural armor won only because the restriction lowered the armor body total. */
    affectsOutcome: boolean
  }
}

export type ResolveCreatureArmorClassInput = {
  rules: ArmorClassRules
  dexModifier?: number
  bodyArmor?: EquippedArmorPiece
  shields?: readonly EquippedArmorPiece[]
  naturalArmorBonus?: number
  fixedAcOffset?: number
  eligibility: { skinCompetesWithArmor: boolean }
  /** Skip the calculated pass and mark its fields unavailable. Requires a fixed offset. */
  calculatedUnavailable?: DerivedFieldReason
}

const SOURCE_RANK = { armor: 2, natural: 1, unarmored: 0 } as const

type BodyCandidate = {
  source: 'unarmored' | 'natural' | 'armor'
  label: string
  protection: number
  bodyAc: number
  rows: CreatureArmorClassRow[]
}

function sumArmorClassModifierBonus(modifiers: readonly EquipmentModifier[] | undefined): number {
  if (!modifiers?.length) return 0
  return modifiers.reduce(
    (total, modifier) => (modifier.kind === 'armor_class' ? total + modifier.bonus : total),
    0,
  )
}

/** Maps catalog armor plus optional legacy instance modifiers to a resolver piece. */
export function toEquippedArmorPiece(
  armor: ArmorAcFields,
  modifiers?: readonly EquipmentModifier[],
): EquippedArmorPiece {
  return {
    ...armor,
    acAdjustment: sumArmorClassModifierBonus(modifiers),
  }
}

/** Maps catalog armor plus instance magic/mechanical AC effects to a resolver piece. */
export function toEquippedArmorPieceForEntry(
  armor: ArmorAcFields,
  entry: EquipmentInstance,
  item: Equipment,
  provider: MagicPropertyDefinitionProvider,
): EquippedArmorPiece {
  return {
    ...armor,
    acAdjustment: resolveEquipmentEntryEffectTotals(entry, item, provider).armor_class,
  }
}

/** Applies the category DEX rule. Shields and heavy armor contribute 0, including negative DEX. */
export function dexModifierForArmor(
  dexModifier: number,
  armor: Pick<ArmorAcFields, 'category'>,
): number {
  if (armor.category === 'shields') return 0
  const rule = resolveArmorDexterityRule(armor.category)
  if (rule.mode === 'none') return 0
  if (rule.mode === 'capped') return Math.min(dexModifier, rule.maxBonus)
  return dexModifier
}

/**
 * DEX before and after the category rule. A restriction reduced the contribution
 * only when `appliedModifier` is lower than `abilityModifier`.
 */
export function resolveArmorDexContribution(
  dexModifier: number,
  armor: Pick<ArmorAcFields, 'category'>,
): ArmorDexContribution {
  if (armor.category === 'shields') {
    return { abilityModifier: dexModifier, appliedModifier: 0, rule: { mode: 'none' } }
  }
  return {
    abilityModifier: dexModifier,
    appliedModifier: dexModifierForArmor(dexModifier, armor),
    rule: resolveArmorDexterityRule(armor.category),
  }
}

/** Protection from body armor: offset, applied DEX, and enhancement. */
export function bodyArmorProtection(armor: EquippedArmorPiece, dexModifier: number): number {
  return (armor.baseAcOffset ?? 0) + dexModifierForArmor(dexModifier, armor) + armor.acAdjustment
}

/** Protection from a shield: bonus plus enhancement. */
export function shieldProtection(shield: EquippedArmorPiece): number {
  return (shield.acBonus ?? 0) + shield.acAdjustment
}

function pieceRef(
  piece: EquippedArmorPiece | undefined,
): { entryId: string; label: string } | undefined {
  if (!piece?.entryId && !piece?.label) return undefined
  return { entryId: piece.entryId ?? '', label: piece.label ?? '' }
}

function unarmoredCandidate(rules: ArmorClassRules, dexModifier: number): BodyCandidate {
  const rows: CreatureArmorClassRow[] = [
    { kind: 'ruleset-base', value: rules.base },
    { kind: 'dex', value: armorClassDelta(rules, dexModifier) },
  ]
  return {
    source: 'unarmored',
    label: getCreatureArmorClassKindLabel('unarmored'),
    protection: dexModifier,
    bodyAc: armorClassFromProtection(rules, dexModifier),
    rows,
  }
}

function naturalCandidate(
  rules: ArmorClassRules,
  dexModifier: number,
  naturalArmorBonus: number,
): BodyCandidate {
  const rows: CreatureArmorClassRow[] = [
    { kind: 'ruleset-base', value: rules.base },
    { kind: 'dex', value: armorClassDelta(rules, dexModifier) },
    { kind: 'natural', value: armorClassDelta(rules, naturalArmorBonus) },
  ]
  const protection = dexModifier + naturalArmorBonus
  return {
    source: 'natural',
    label: `${getCreatureArmorClassKindLabel('natural')} armor`,
    protection,
    bodyAc: armorClassFromProtection(rules, protection),
    rows,
  }
}

function armorCandidate(
  rules: ArmorClassRules,
  dexModifier: number,
  armor: EquippedArmorPiece,
): BodyCandidate {
  const contribution = resolveArmorDexContribution(dexModifier, armor)
  const rows: CreatureArmorClassRow[] = [
    {
      kind: 'armor-base',
      entryId: armor.entryId ?? '',
      label: armor.label ?? 'Armor',
      value: armorClassFromProtection(rules, armor.baseAcOffset ?? 0),
    },
  ]
  if (contribution.rule.mode !== 'none') {
    rows.push({
      kind: 'dex',
      value: armorClassDelta(rules, contribution.appliedModifier),
      ...(contribution.rule.mode === 'capped' ? { cap: contribution.rule.maxBonus } : {}),
    })
  }
  if (armor.acAdjustment !== 0) {
    rows.push({
      kind: 'enhancement',
      target: 'armor',
      entryId: armor.entryId ?? '',
      label: armor.enhancementLabel ?? 'Enhancement',
      value: armorClassDelta(rules, armor.acAdjustment),
    })
  }
  const protection = bodyArmorProtection(armor, dexModifier)
  return {
    source: 'armor',
    label: armor.label ?? 'Armor',
    protection,
    bodyAc: armorClassFromProtection(rules, protection),
    rows,
  }
}

function selectWinner(candidates: readonly BodyCandidate[]): {
  winner: BodyCandidate
  tie: boolean
} {
  let winner = candidates[0]!
  for (const next of candidates.slice(1)) {
    if (next.protection > winner.protection) {
      winner = next
      continue
    }
    if (
      next.protection === winner.protection &&
      SOURCE_RANK[next.source] > SOURCE_RANK[winner.source]
    ) {
      winner = next
    }
  }
  const tie = candidates.some(
    (candidate) => candidate !== winner && candidate.protection === winner.protection,
  )
  return { winner, tie }
}

function shieldRows(
  rules: ArmorClassRules,
  shields: readonly EquippedArmorPiece[],
): CreatureArmorClassRow[] {
  const rows: CreatureArmorClassRow[] = []
  for (const shield of shields) {
    rows.push({
      kind: 'shield',
      entryId: shield.entryId ?? '',
      label: shield.label ?? 'Shield',
      value: armorClassDelta(rules, shield.acBonus ?? 0),
    })
    if (shield.acAdjustment !== 0) {
      rows.push({
        kind: 'enhancement',
        target: 'shield',
        entryId: shield.entryId ?? '',
        label: shield.enhancementLabel ?? 'Enhancement',
        value: armorClassDelta(rules, shield.acAdjustment),
      })
    }
  }
  return rows
}

function sharedShieldDelta(rows: readonly CreatureArmorClassRow[]): number {
  return rows.reduce((total, row) => total + row.value, 0)
}

function dexRestriction(input: {
  bodyArmor: EquippedArmorPiece | undefined
  dexModifier: number
  winner: BodyCandidate
  candidates: readonly BodyCandidate[]
}): CreatureArmorClassResolution['dexRestriction'] {
  const { bodyArmor, dexModifier, winner, candidates } = input
  if (!bodyArmor || bodyArmor.category === 'shields') return undefined
  const contribution = resolveArmorDexContribution(dexModifier, bodyArmor)
  if (contribution.rule.mode === 'full') return undefined

  const armor = candidates.find((candidate) => candidate.source === 'armor')
  const natural = candidates.find((candidate) => candidate.source === 'natural')
  const reduced = contribution.appliedModifier < contribution.abilityModifier
  const unrestrictedProtection =
    armor === undefined
      ? undefined
      : armor.protection + (contribution.abilityModifier - contribution.appliedModifier)
  const affectsOutcome =
    winner.source === 'natural' &&
    reduced &&
    natural !== undefined &&
    unrestrictedProtection !== undefined &&
    unrestrictedProtection >= natural.protection

  return {
    mode: contribution.rule.mode,
    abilityModifier: contribution.abilityModifier,
    appliedModifier: contribution.appliedModifier,
    ...(contribution.rule.mode === 'capped' ? { maxBonus: contribution.rule.maxBonus } : {}),
    affectsOutcome,
  }
}

function fixedOnlyResolution(
  rules: ArmorClassRules,
  fixedAcOffset: number,
  calculated: CreatureArmorClassResolution | undefined,
  calculatedUnavailable?: DerivedFieldReason,
): CreatureArmorClassResolution {
  const ac = armorClassFromProtection(rules, fixedAcOffset)
  return {
    ac,
    source: 'fixed',
    tie: false,
    rows: [{ kind: 'fixed', value: ac }],
    alternatives: calculatedUnavailable
      ? unavailableField(calculatedUnavailable)
      : (calculated?.alternatives ?? resolvedField([])),
    ...(calculatedUnavailable
      ? { calculatedAc: unavailableField<number>(calculatedUnavailable) }
      : calculated
        ? { calculatedAc: resolvedField(calculated.ac) }
        : {}),
    ...(calculated?.bodyArmor ? { bodyArmor: calculated.bodyArmor } : {}),
    ...(calculated?.shield ? { shield: calculated.shield } : {}),
  }
}

function calculateArmorClass(
  input: ResolveCreatureArmorClassInput & { dexModifier: number },
): CreatureArmorClassResolution {
  const { rules, dexModifier, bodyArmor, eligibility } = input
  const shields = input.shields ?? []
  const candidates: BodyCandidate[] = []
  if (eligibility.skinCompetesWithArmor) {
    candidates.push(
      input.naturalArmorBonus === undefined
        ? unarmoredCandidate(rules, dexModifier)
        : naturalCandidate(rules, dexModifier, input.naturalArmorBonus),
    )
    if (bodyArmor) candidates.push(armorCandidate(rules, dexModifier, bodyArmor))
  } else if (bodyArmor) {
    candidates.push(armorCandidate(rules, dexModifier, bodyArmor))
  } else {
    candidates.push(unarmoredCandidate(rules, dexModifier))
  }

  const { winner, tie } = selectWinner(candidates)
  const shieldsApplied = shieldRows(rules, shields)
  const shieldDelta = sharedShieldDelta(shieldsApplied)
  const alternatives = candidates
    .filter((candidate) => candidate !== winner)
    .map((candidate) => ({
      source: candidate.source,
      label: candidate.label,
      ac: candidate.bodyAc + shieldDelta,
    }))
  const restriction = dexRestriction({ bodyArmor, dexModifier, winner, candidates })
  const shield = shields[0]

  return {
    ac: winner.bodyAc + shieldDelta,
    source: winner.source,
    tie,
    rows: [...winner.rows, ...shieldsApplied],
    alternatives: resolvedField(alternatives),
    ...(bodyArmor ? { bodyArmor: pieceRef(bodyArmor) } : {}),
    ...(shield ? { shield: pieceRef(shield) } : {}),
    ...(restriction ? { dexRestriction: restriction } : {}),
  }
}

/**
 * One Armor Class from resolved candidates. Selection uses protection, so the
 * same inputs pick the same winner in either direction.
 */
export function resolveCreatureArmorClass(
  input: ResolveCreatureArmorClassInput,
): CreatureArmorClassResolution {
  const { rules, fixedAcOffset, calculatedUnavailable } = input
  if (calculatedUnavailable !== undefined) {
    if (fixedAcOffset === undefined) {
      throw new Error('calculatedUnavailable requires fixedAcOffset')
    }
    return fixedOnlyResolution(rules, fixedAcOffset, undefined, calculatedUnavailable)
  }

  if (input.dexModifier === undefined) {
    if (fixedAcOffset === undefined) {
      throw new Error('resolveCreatureArmorClass requires dexModifier or fixedAcOffset')
    }
    return fixedOnlyResolution(rules, fixedAcOffset, undefined)
  }

  const calculated = calculateArmorClass({ ...input, dexModifier: input.dexModifier })
  if (fixedAcOffset === undefined) return calculated
  return fixedOnlyResolution(rules, fixedAcOffset, calculated)
}
