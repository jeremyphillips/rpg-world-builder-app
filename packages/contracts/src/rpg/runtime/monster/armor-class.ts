import { isArmorEquipment, type Equipment } from '../../content/equipment'
import { monsterArmorOwnershipViolations } from '../../content/monster/monster-armor-ownership'
import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import { resolveEquipmentEntryEffects } from '../../content/equipment/instance/equipment-effect-totals'
import { normalizeEquipmentInstance } from '../../content/equipment/instance/normalize-equipment-instance'
import type { MonsterBody } from '../../content/monster'
import type { ArmorClassRules } from '../../vocab/mechanics/armor-class-scale'
import { abilityModifier } from '../creature/ability-modifier'
import {
  resolveCreatureArmorClass,
  resolveCreatureArmorSlot,
  toEquippedArmorPieceForEntry,
  type CreatureArmorClassAlternative,
  type CreatureArmorClassResolution,
  type CreatureArmorClassRow,
  type CreatureArmorClassSource,
  type EquippedArmorPiece,
} from '../creature/armor-class'
import type { CreatureEquipmentCatalog } from '../creature/equipment'
import { resolvedField, unavailableField, type DerivedField } from '../creature/derived-field'

export type MonsterArmorClassSource = CreatureArmorClassSource
export type MonsterArmorClassAlternative = CreatureArmorClassAlternative
export type MonsterArmorClassRow = CreatureArmorClassRow
export type MonsterArmorClassResolution = CreatureArmorClassResolution

type ArmorContributionRow = {
  entryId: string
  label: string
  item: Extract<Equipment, { kind: 'armor' }>
  entry: EquipmentInstance & { entryId: string }
  piece: EquippedArmorPiece
}

export type ResolveMonsterArmorClassInput = {
  monster: {
    armorClass?: Pick<MonsterBody['armorClass'], 'naturalArmorBonus' | 'fixedAcOffset'>
    equipment?: readonly (EquipmentInstance & { entryId: string })[]
    abilityScores?: { dex?: number }
  }
  equipmentCatalog: CreatureEquipmentCatalog
  armorClassRules: ArmorClassRules
  magicPropertyProvider: MagicPropertyDefinitionProvider
}

function equippedArmorRows(
  monster: ResolveMonsterArmorClassInput['monster'],
  equipmentCatalog: CreatureEquipmentCatalog,
  magicPropertyProvider: MagicPropertyDefinitionProvider,
): { rows: ArmorContributionRow[]; unresolved: boolean } {
  const rows: ArmorContributionRow[] = []
  let unresolved = false

  for (const entry of monster.equipment ?? []) {
    if (!entry.equipped) continue
    const item = equipmentCatalog.get(entry.equipmentId)
    if (!item) {
      unresolved = true
      continue
    }
    if (!isArmorEquipment(item) || !resolveCreatureArmorSlot(item)) continue
    rows.push({
      entryId: entry.entryId,
      label: entry.customName ?? item.name,
      item,
      entry,
      piece: toEquippedArmorPieceForEntry(item, entry, item, magicPropertyProvider),
    })
  }

  return { rows, unresolved }
}

function enhancementLabel(
  row: ArmorContributionRow,
  provider: MagicPropertyDefinitionProvider,
): string | undefined {
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
  return named.length === 1 && !manual ? named[0]! : 'Enhancement'
}

function labeledPiece(
  row: ArmorContributionRow,
  provider: MagicPropertyDefinitionProvider,
): EquippedArmorPiece {
  return {
    ...row.piece,
    entryId: row.entryId,
    label: row.label,
    enhancementLabel: enhancementLabel(row, provider),
  }
}

const MONSTER_ARMOR_ELIGIBILITY = { skinCompetesWithArmor: true } as const

function wornMonsterPieces(
  rows: readonly ArmorContributionRow[],
  magicPropertyProvider: MagicPropertyDefinitionProvider,
): { bodyArmor?: EquippedArmorPiece; shields: EquippedArmorPiece[] } {
  const bodyRow = rows.find((row) => resolveCreatureArmorSlot(row.item) === 'body-armor')
  return {
    bodyArmor: bodyRow ? labeledPiece(bodyRow, magicPropertyProvider) : undefined,
    shields: rows
      .filter((row) => resolveCreatureArmorSlot(row.item) === 'shield')
      .map((row) => labeledPiece(row, magicPropertyProvider)),
  }
}

function resolveWornMonsterArmor(
  args: ResolveMonsterArmorClassInput,
  rows: readonly ArmorContributionRow[],
): DerivedField<MonsterArmorClassResolution> {
  const { monster, armorClassRules, magicPropertyProvider } = args
  const fixedAcOffset = monster.armorClass?.fixedAcOffset
  const dexScore = monster.abilityScores?.dex
  if (dexScore === undefined && fixedAcOffset === undefined)
    return unavailableField('missing-input')

  const worn = wornMonsterPieces(rows, magicPropertyProvider)
  return resolvedField(
    resolveCreatureArmorClass({
      rules: armorClassRules,
      dexModifier: dexScore === undefined ? undefined : abilityModifier(dexScore),
      bodyArmor: worn.bodyArmor,
      shields: worn.shields,
      naturalArmorBonus: monster.armorClass?.naturalArmorBonus,
      fixedAcOffset,
      eligibility: MONSTER_ARMOR_ELIGIBILITY,
    }),
  )
}

function resolveUnresolvedMonsterArmor(
  args: ResolveMonsterArmorClassInput,
): DerivedField<MonsterArmorClassResolution> {
  const fixedAcOffset = args.monster.armorClass?.fixedAcOffset
  if (fixedAcOffset === undefined) return unavailableField('missing-reference')
  return resolvedField(
    resolveCreatureArmorClass({
      rules: args.armorClassRules,
      fixedAcOffset,
      shields: [],
      eligibility: MONSTER_ARMOR_ELIGIBILITY,
      calculatedUnavailable: 'missing-reference',
    }),
  )
}

/** One Armor Class for a monster. Eligibility and labels stay here; math is shared. */
export function resolveMonsterArmorClass(
  args: ResolveMonsterArmorClassInput,
): DerivedField<MonsterArmorClassResolution> {
  const { monster, equipmentCatalog, magicPropertyProvider } = args
  if (monsterArmorOwnershipViolations(monster.equipment ?? [], equipmentCatalog).length > 0) {
    return unavailableField('conflict')
  }

  const equipped = equippedArmorRows(monster, equipmentCatalog, magicPropertyProvider)
  if (equipped.unresolved) return resolveUnresolvedMonsterArmor(args)
  return resolveWornMonsterArmor(args, equipped.rows)
}
