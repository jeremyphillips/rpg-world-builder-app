import { isArmorEquipment, type Equipment } from '../../content/equipment'
import { monsterArmorOwnershipViolations } from '../../content/monster/monster-armor-ownership'
import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import { resolveEquipmentEntryEffects } from '../../content/equipment/instance/equipment-effect-totals'
import { normalizeEquipmentInstance } from '../../content/equipment/instance/normalize-equipment-instance'
import type { MonsterBody } from '../../content/monster'
import { getCreatureArmorClassKindLabel } from '../../vocab/creature-armor-class-kind'
import type { ArmorClassBase } from '../../vocab/mechanics/edition-preset-mechanics'
import { abilityModifier } from '../creature/ability-modifier'
import {
  resolveArmorDexContribution,
  resolveCreatureArmorSlot,
  toEquippedArmorPieceForEntry,
  type EquippedArmorPiece,
} from '../creature/armor-class'
import type { CreatureEquipmentCatalog } from '../creature/equipment'
import { resolvedField, unavailableField, type DerivedField } from './derived-field'

export type MonsterArmorClassSource = 'unarmored' | 'natural' | 'armor' | 'fixed'

export type MonsterArmorClassAlternative = {
  source: 'natural' | 'unarmored' | 'armor'
  label: string
  ac: number
}

export type MonsterArmorClassRow =
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

export type MonsterArmorClassResolution = {
  ac: number
  source: MonsterArmorClassSource
  /** Rows that contribute to `ac`. Fixed overrides replace the calculated rows. */
  rows: MonsterArmorClassRow[]
  alternatives: MonsterArmorClassAlternative[]
  /** Calculated total while a fixed override is active. */
  calculatedAc?: number
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

type ArmorContributionRow = {
  entryId: string
  label: string
  item: Extract<Equipment, { kind: 'armor' }>
  entry: EquipmentInstance & { entryId: string }
  piece: EquippedArmorPiece
}

type BodyCandidate = {
  source: 'unarmored' | 'natural' | 'armor'
  label: string
  bodyAc: number
  rows: MonsterArmorClassRow[]
}

export type ResolveMonsterArmorClassInput = {
  monster: {
    armorClass?: Pick<MonsterBody['armorClass'], 'naturalArmorBonus' | 'fixedValue'>
    equipment?: readonly (EquipmentInstance & { entryId: string })[]
    abilityScores?: { dex?: number }
  }
  equipmentCatalog: CreatureEquipmentCatalog
  acBase: ArmorClassBase
  magicPropertyProvider: MagicPropertyDefinitionProvider
}

function equippedArmorRows(
  monster: ResolveMonsterArmorClassInput['monster'],
  equipmentCatalog: CreatureEquipmentCatalog,
  magicPropertyProvider: MagicPropertyDefinitionProvider,
): ArmorContributionRow[] {
  return (monster.equipment ?? [])
    .filter((entry) => entry.equipped)
    .flatMap((entry) => {
      const item = equipmentCatalog.get(entry.equipmentId)
      if (!item || !isArmorEquipment(item) || !resolveCreatureArmorSlot(item)) return []
      return [
        {
          entryId: entry.entryId,
          label: entry.customName ?? item.name,
          item,
          entry,
          piece: toEquippedArmorPieceForEntry(item, entry, item, magicPropertyProvider),
        },
      ]
    })
}

function enhancementRow(
  row: ArmorContributionRow,
  target: 'armor' | 'shield',
  provider: MagicPropertyDefinitionProvider,
): MonsterArmorClassRow | undefined {
  if (row.piece.acAdjustment === 0) return undefined
  const effects = resolveEquipmentEntryEffects(row.entry, row.item, provider)
  const named = effects.magic.resolved
    .filter((preset) =>
      preset.definition.effects.some(
        (effect) => effect.target === 'armor_class' && effect.bonus !== 0,
      ),
    )
    .map((preset) => preset.definition.name)
  const manual = (normalizeEquipmentInstance(row.entry).adjustments ?? []).some(
    (effect) => effect.target === 'armor_class' && effect.bonus !== 0,
  )
  const label = named.length === 1 && !manual ? named[0]! : 'Enhancement'
  return {
    kind: 'enhancement',
    target,
    entryId: row.entryId,
    label,
    value: row.piece.acAdjustment,
  }
}

function skinCandidate(
  acBase: ArmorClassBase,
  dexModifier: number,
  naturalBonus: number | undefined,
): BodyCandidate {
  const rows: MonsterArmorClassRow[] = [
    { kind: 'ruleset-base', value: acBase },
    { kind: 'dex', value: dexModifier },
  ]
  if (naturalBonus === undefined) {
    return {
      source: 'unarmored',
      label: getCreatureArmorClassKindLabel('unarmored'),
      bodyAc: acBase + dexModifier,
      rows,
    }
  }
  rows.push({ kind: 'natural', value: naturalBonus })
  return {
    source: 'natural',
    label: `${getCreatureArmorClassKindLabel('natural')} armor`,
    bodyAc: acBase + dexModifier + naturalBonus,
    rows,
  }
}

function armorCandidate(
  row: ArmorContributionRow,
  dexModifier: number,
  provider: MagicPropertyDefinitionProvider,
): BodyCandidate {
  const base = row.item.baseAc ?? 0
  const contribution = resolveArmorDexContribution(dexModifier, row.piece)
  const rows: MonsterArmorClassRow[] = [
    { kind: 'armor-base', entryId: row.entryId, label: row.label, value: base },
  ]
  if (contribution.rule.mode !== 'none') {
    rows.push({
      kind: 'dex',
      value: contribution.appliedModifier,
      ...(contribution.rule.mode === 'capped' ? { cap: contribution.rule.maxBonus } : {}),
    })
  }
  const enhancement = enhancementRow(row, 'armor', provider)
  if (enhancement) rows.push(enhancement)
  return {
    source: 'armor',
    label: row.label,
    bodyAc: base + contribution.appliedModifier + row.piece.acAdjustment,
    rows,
  }
}

function preferCandidate(current: BodyCandidate, next: BodyCandidate): BodyCandidate {
  if (next.bodyAc > current.bodyAc) return next
  if (next.bodyAc < current.bodyAc) return current
  return next.source === 'armor' ? next : current
}

function shieldBonus(row: ArmorContributionRow): number {
  return (row.item.acBonus ?? 0) + row.piece.acAdjustment
}

function appendShield(
  rows: MonsterArmorClassRow[],
  shield: ArmorContributionRow | undefined,
  provider: MagicPropertyDefinitionProvider,
): MonsterArmorClassRow[] {
  if (!shield) return rows
  const next = [
    ...rows,
    {
      kind: 'shield' as const,
      entryId: shield.entryId,
      label: shield.label,
      value: shield.item.acBonus ?? 0,
    },
  ]
  const enhancement = enhancementRow(shield, 'shield', provider)
  return enhancement ? [...next, enhancement] : next
}

function pieceRef(
  row: ArmorContributionRow | undefined,
): { entryId: string; label: string } | undefined {
  if (!row) return undefined
  return { entryId: row.entryId, label: row.label }
}

function calculateArmorClass(input: {
  acBase: ArmorClassBase
  dexModifier: number
  naturalBonus: number | undefined
  bodyArmor: ArmorContributionRow | undefined
  shield: ArmorContributionRow | undefined
  provider: MagicPropertyDefinitionProvider
}): MonsterArmorClassResolution {
  const { acBase, dexModifier, naturalBonus, bodyArmor, shield, provider } = input
  const candidates = [skinCandidate(acBase, dexModifier, naturalBonus)]
  if (bodyArmor) candidates.push(armorCandidate(bodyArmor, dexModifier, provider))
  const winner = candidates.reduce(preferCandidate)
  const bonus = shield ? shieldBonus(shield) : 0
  const alternatives = candidates
    .filter((candidate) => candidate !== winner)
    .map((candidate) => ({
      source: candidate.source,
      label: candidate.label,
      ac: candidate.bodyAc + bonus,
    }))
  const dexRestriction = resolveDexRestriction({
    bodyArmor,
    dexModifier,
    winner,
    candidates,
  })
  return {
    ac: winner.bodyAc + bonus,
    source: winner.source,
    rows: appendShield(winner.rows, shield, provider),
    alternatives,
    ...optionalPiece('bodyArmor', pieceRef(bodyArmor)),
    ...optionalPiece('shield', pieceRef(shield)),
    ...(dexRestriction ? { dexRestriction } : {}),
  }
}

function resolveDexRestriction(input: {
  bodyArmor: ArmorContributionRow | undefined
  dexModifier: number
  winner: BodyCandidate
  candidates: readonly BodyCandidate[]
}): MonsterArmorClassResolution['dexRestriction'] {
  const { bodyArmor, dexModifier, winner, candidates } = input
  if (!bodyArmor || bodyArmor.item.category === 'shields') return undefined
  const contribution = resolveArmorDexContribution(dexModifier, bodyArmor.piece)
  if (contribution.rule.mode === 'full') return undefined

  const armorCandidate = candidates.find((candidate) => candidate.source === 'armor')
  const naturalCandidate = candidates.find((candidate) => candidate.source === 'natural')
  const reduced = contribution.appliedModifier < contribution.abilityModifier
  const unrestrictedBody =
    armorCandidate === undefined
      ? undefined
      : armorCandidate.bodyAc + (contribution.abilityModifier - contribution.appliedModifier)
  const affectsOutcome =
    winner.source === 'natural' &&
    reduced &&
    naturalCandidate !== undefined &&
    unrestrictedBody !== undefined &&
    unrestrictedBody >= naturalCandidate.bodyAc

  return {
    mode: contribution.rule.mode,
    abilityModifier: contribution.abilityModifier,
    appliedModifier: contribution.appliedModifier,
    ...(contribution.rule.mode === 'capped' ? { maxBonus: contribution.rule.maxBonus } : {}),
    affectsOutcome,
  }
}

function optionalPiece(
  key: 'bodyArmor' | 'shield',
  value: { entryId: string; label: string } | undefined,
): Partial<Pick<MonsterArmorClassResolution, 'bodyArmor' | 'shield'>> {
  if (!value) return {}
  return { [key]: value }
}

function fixedResolution(
  fixedValue: number,
  calculated: MonsterArmorClassResolution | undefined,
): MonsterArmorClassResolution {
  return {
    ac: fixedValue,
    source: 'fixed',
    rows: [{ kind: 'fixed', value: fixedValue }],
    alternatives: calculated?.alternatives ?? [],
    ...(calculated ? { calculatedAc: calculated.ac } : {}),
    ...(calculated?.bodyArmor ? { bodyArmor: calculated.bodyArmor } : {}),
    ...(calculated?.shield ? { shield: calculated.shield } : {}),
  }
}

/** One Armor Class for a monster: highest of natural/unarmored and worn armor, then shield, then a fixed override. */
export function resolveMonsterArmorClass(
  args: ResolveMonsterArmorClassInput,
): DerivedField<MonsterArmorClassResolution> {
  const { monster, equipmentCatalog, acBase, magicPropertyProvider } = args
  // Ownership conflicts invalidate AC before candidates and before a fixed override,
  // including when the extra piece is unequipped.
  if (monsterArmorOwnershipViolations(monster.equipment ?? [], equipmentCatalog).length > 0) {
    return unavailableField('conflict')
  }

  const rows = equippedArmorRows(monster, equipmentCatalog, magicPropertyProvider)
  const bodyArmor = rows.filter((row) => resolveCreatureArmorSlot(row.item) === 'body-armor')
  const shields = rows.filter((row) => resolveCreatureArmorSlot(row.item) === 'shield')

  const fixedValue = monster.armorClass?.fixedValue
  const dexScore = monster.abilityScores?.dex
  if (dexScore === undefined) {
    if (fixedValue === undefined) return unavailableField('missing-input')
    return resolvedField(fixedResolution(fixedValue, undefined))
  }

  const calculated = calculateArmorClass({
    acBase,
    dexModifier: abilityModifier(dexScore),
    naturalBonus: monster.armorClass?.naturalArmorBonus,
    bodyArmor: bodyArmor[0],
    shield: shields[0],
    provider: magicPropertyProvider,
  })
  if (fixedValue === undefined) return resolvedField(calculated)
  return resolvedField(fixedResolution(fixedValue, calculated))
}
