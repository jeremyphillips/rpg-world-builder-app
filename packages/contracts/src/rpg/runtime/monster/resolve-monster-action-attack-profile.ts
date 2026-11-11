import { isWeaponEquipment, type Equipment } from '../../content/equipment'
import { findSpellCastingSource } from '../../content/monster/spell-casting-source'
import type {
  MonsterAction,
  MonsterActionDraft,
  MonsterBody,
  MonsterReaction,
  MonsterReactionDraft,
} from '../../content/monster'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import { resolveEquipmentMagicProperties } from '../../content/equipment/instance/resolve-equipment-magic-properties'
import type { WeaponDamage } from '../../content/equipment/weapon-variant'
import { type RollValue } from '../../primitives/mechanics/roll'
import type { Ability } from '../../vocab/ability'
import type { WeaponProperty } from '../../vocab/weapon/property'
import { abilityModifier } from '../creature/ability-modifier'
import type { CreatureEquipmentCatalog } from '../creature/equipment'
import { isWeaponProficient } from '../creature/proficiencies'
import { resolveInventoryWeaponAttackTotals } from '../creature/resolve-inventory-weapon-attack'
import { resolveStatBlockDamagePart } from '../creature/stat-block-average'
import {
  resolveWeaponAttackAbilityModifier,
  resolveWeaponAttackModes,
  resolveWeaponAttackReach,
  weaponAttackBonus,
} from '../creature/weapon-attack'
import { unavailableField, type DerivedField, type DerivedFieldReason } from './derived-field'
import { resolveMonsterActionIdentity } from './resolve-monster-action-identity'

export const MONSTER_ACTION_ATTACK_KINDS = ['weapon', 'natural-weapon', 'attack'] as const
export type MonsterActionAttackKind = (typeof MONSTER_ACTION_ATTACK_KINDS)[number]

export const MONSTER_ACTION_ATTACK_KIND_SET: ReadonlySet<MonsterActionAttackKind> = new Set(
  MONSTER_ACTION_ATTACK_KINDS,
)

export function isMonsterActionAttackKind(kind: string): kind is MonsterActionAttackKind {
  return MONSTER_ACTION_ATTACK_KIND_SET.has(kind as MonsterActionAttackKind)
}

export type MonsterActionAttackRoll = {
  expression: string
  average: number
  damageTypeId: string
}

export type MonsterActionOnHitSource = 'action' | 'magic-property'

type ResolvedOnHitOwner = {
  source: MonsterActionOnHitSource
  propertyId?: string
}

export type ResolvedOnHitDamage = ResolvedOnHitOwner & {
  kind: 'damage'
  expression: string
  average: number
  damageTypeId: string
  description?: string
}

export type ResolvedOnHitCondition = ResolvedOnHitOwner & {
  kind: 'condition'
  conditionId: string
  description?: string
}

export type ResolvedOnHitNote = ResolvedOnHitOwner & {
  kind: 'note'
  description: string
}

/** Ordered on-hit presentation. Damage entries are the only numeric riders. */
export type ResolvedOnHitEffect = ResolvedOnHitDamage | ResolvedOnHitCondition | ResolvedOnHitNote

export type MonsterActionAttackUnresolvedCapability = {
  id: 'versatile'
  reason: DerivedFieldReason
}

/** Structured attack math before stat-block string formatting. */
export type MonsterActionAttackProfile = {
  sourceKind: 'weapon' | 'natural-weapon' | 'attack'
  /**
   * Mechanical source label for breakdowns. Catalog weapon name, or the natural
   * or authored label. May differ from `name` when the action or instance has a custom name.
   */
  sourceLabel: string
  name: string
  governingAbility: Ability
  /** Proficiency bonus included in `attackBonus`, or 0 when the attack is not proficient. */
  proficiencyContribution: number
  attackBonus: number
  modes: Array<'melee' | 'ranged'>
  reach?: number
  range?: { normal: number; long?: number }
  primary: MonsterActionAttackRoll
  onHit: ResolvedOnHitEffect[]
  /** Catalog weapon properties. Absent for authored attacks. */
  weaponProperties?: readonly string[]
  /**
   * Catalog traits the single attack line does not resolve. Versatile two-hand
   * damage stays here. Thrown is represented as melee and ranged on one profile.
   */
  unresolvedCapabilities: readonly MonsterActionAttackUnresolvedCapability[]
}

type ProfileAction = MonsterAction | MonsterReaction | MonsterActionDraft | MonsterReactionDraft

type ProfileMonster = {
  abilityScores?: Partial<MonsterBody['abilityScores']>
  equipment?: MonsterBody['equipment']
  proficiencies?: { weapons?: MonsterBody['proficiencies']['weapons'] }
  actions?: readonly ProfileAction[]
  bonusActions?: readonly ProfileAction[]
  reactions?: readonly ProfileAction[]
}

export type ResolveMonsterActionAttackProfileInput = {
  action: ProfileAction
  monster: ProfileMonster
  equipmentCatalog: CreatureEquipmentCatalog
  proficiencyBonus: number | undefined
  magicPropertyProvider: MagicPropertyDefinitionProvider
}

function hasDamageRoll(value: unknown): value is RollValue {
  if (!value || typeof value !== 'object') return false
  const roll = value as { dice?: { count?: number; faces?: number }; flat?: number }
  const dice = roll.dice
  const diceOk =
    dice !== undefined && typeof dice.count === 'number' && typeof dice.faces === 'number'
  return diceOk || typeof roll.flat === 'number'
}

function effectList(onHit: unknown): unknown[] {
  if (!onHit || typeof onHit !== 'object' || !('effects' in onHit)) return []
  const list = (onHit as { effects?: unknown }).effects
  return Array.isArray(list) ? list : []
}

function trimmedDescription(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

type OnHitEffectRow = {
  kind?: unknown
  roll?: unknown
  damageType?: unknown
  conditionId?: unknown
  description?: unknown
}

function onHitOwner(owner: ResolvedOnHitOwner): ResolvedOnHitOwner {
  return owner.propertyId ? owner : { source: owner.source }
}

function resolveDamageOnHit(
  row: OnHitEffectRow,
  owner: ResolvedOnHitOwner,
  description: string | undefined,
): ResolvedOnHitDamage | undefined {
  if (!hasDamageRoll(row.roll) || typeof row.damageType !== 'string') return undefined
  const resolved = resolveStatBlockDamagePart(row.roll, 0)
  return {
    ...onHitOwner(owner),
    kind: 'damage',
    expression: resolved.expression,
    average: resolved.average,
    damageTypeId: row.damageType,
    ...(description ? { description } : {}),
  }
}

function resolveConditionOnHit(
  row: OnHitEffectRow,
  owner: ResolvedOnHitOwner,
  description: string | undefined,
): ResolvedOnHitCondition | undefined {
  if (typeof row.conditionId !== 'string' || !row.conditionId) return undefined
  return {
    ...onHitOwner(owner),
    kind: 'condition',
    conditionId: row.conditionId,
    ...(description ? { description } : {}),
  }
}

function resolveOnHitEffect(
  effect: unknown,
  owner: ResolvedOnHitOwner,
): ResolvedOnHitEffect | undefined {
  if (!effect || typeof effect !== 'object' || !('kind' in effect)) return undefined
  const row = effect as OnHitEffectRow
  const description = trimmedDescription(row.description)
  if (row.kind === 'damage') return resolveDamageOnHit(row, owner, description)
  if (row.kind === 'condition') return resolveConditionOnHit(row, owner, description)
  if (row.kind === 'note' && description) return { ...onHitOwner(owner), kind: 'note', description }
  return undefined
}

function resolveOnHitEffects(
  actionOnHit: unknown,
  propertyEffects: readonly { effect: unknown; propertyId: string }[],
): ResolvedOnHitEffect[] {
  const actionEffects = effectList(actionOnHit).flatMap((effect) => {
    const resolved = resolveOnHitEffect(effect, { source: 'action' })
    return resolved ? [resolved] : []
  })
  const fromProperties = propertyEffects.flatMap(({ effect, propertyId }) => {
    const resolved = resolveOnHitEffect(effect, { source: 'magic-property', propertyId })
    return resolved ? [resolved] : []
  })
  return [...actionEffects, ...fromProperties]
}

function propertyOnHitEffects(
  entry: MonsterBody['equipment'][number],
  item: Equipment,
  provider: MagicPropertyDefinitionProvider,
): { effect: unknown; propertyId: string }[] {
  const magic = resolveEquipmentMagicProperties(entry, item, provider)
  return magic.resolved.flatMap(({ definition }) =>
    effectList(definition.onHit).map((effect) => ({ effect, propertyId: definition.id })),
  )
}

// fallow-ignore-next-line complexity
function governingAbility(
  weapon: { mode: 'melee' | 'ranged'; properties: readonly WeaponProperty[] },
  scores: Partial<Record<Ability, number>>,
): { ability: Ability; modifier: number } | undefined {
  const modifier = resolveWeaponAttackAbilityModifier(weapon, scores)
  if (modifier === undefined) return undefined

  if (weapon.properties.includes('finesse')) {
    const strMod = typeof scores.str === 'number' ? abilityModifier(scores.str) : undefined
    const dexMod = typeof scores.dex === 'number' ? abilityModifier(scores.dex) : undefined
    if (strMod === modifier && (dexMod === undefined || strMod >= dexMod)) {
      return { ability: 'str', modifier }
    }
    if (dexMod === modifier) return { ability: 'dex', modifier }
  }

  if (weapon.mode === 'ranged') {
    return typeof scores.dex === 'number' ? { ability: 'dex', modifier } : undefined
  }
  return typeof scores.str === 'number' ? { ability: 'str', modifier } : undefined
}

function catalogWeapon(
  monster: ProfileMonster,
  equipmentCatalog: CreatureEquipmentCatalog,
  equipmentEntryId: string,
):
  | { entry: MonsterBody['equipment'][number]; catalogItem: Extract<Equipment, { kind: 'weapon' }> }
  | undefined {
  const entry = (monster.equipment ?? []).find((row) => row.entryId === equipmentEntryId)
  if (!entry) return undefined
  const catalogItem = equipmentCatalog.get(entry.equipmentId)
  if (!catalogItem || !isWeaponEquipment(catalogItem)) return undefined
  return { entry, catalogItem }
}

function unresolvedWeaponCapabilities(
  properties: readonly WeaponProperty[],
): MonsterActionAttackUnresolvedCapability[] {
  const unresolved: MonsterActionAttackUnresolvedCapability[] = []
  if (properties.includes('versatile'))
    unresolved.push({ id: 'versatile', reason: 'missing-input' })
  return unresolved
}

// fallow-ignore-next-line complexity
function resolveWeaponProfile(
  action: Extract<ProfileAction, { kind: 'weapon' }>,
  args: ResolveMonsterActionAttackProfileInput,
): DerivedField<MonsterActionAttackProfile> {
  if (args.proficiencyBonus === undefined) return unavailableField('missing-input')
  if (!action.equipmentEntryId) return unavailableField('missing-reference')
  const resolved = catalogWeapon(args.monster, args.equipmentCatalog, action.equipmentEntryId)
  if (!resolved) return unavailableField('missing-reference')

  const { entry, catalogItem } = resolved
  const scores = args.monster.abilityScores ?? {}
  const governing = governingAbility(catalogItem, scores)
  if (!governing) return unavailableField('missing-reference')

  const override = hasDamageRoll(action.damage) ? (action.damage as WeaponDamage) : undefined
  const catalogDamage = hasDamageRoll(catalogItem.damage) ? catalogItem.damage : undefined
  if (!override && !catalogDamage) return unavailableField('missing-reference')

  const proficient = isWeaponProficient(catalogItem, args.monster.proficiencies?.weapons ?? [])
  const totals = resolveInventoryWeaponAttackTotals({
    entry,
    item: catalogItem,
    abilityModifier: governing.modifier,
    proficient,
    proficiencyBonus: args.proficiencyBonus,
    provider: args.magicPropertyProvider,
    ...(override ? { damage: override } : {}),
  })
  if (totals?.attackBonus === undefined || totals.damageAverage === undefined) {
    return unavailableField('missing-reference')
  }

  const primary: MonsterActionAttackRoll = {
    expression: totals.damageExpression ?? '',
    average: totals.damageAverage,
    damageTypeId: catalogItem.damageType ?? '',
  }
  if (!primary.expression) return unavailableField('missing-reference')

  const modes = resolveWeaponAttackModes(catalogItem)
  const reach = resolveWeaponAttackReach(catalogItem)
  return {
    status: 'resolved',
    value: {
      sourceKind: 'weapon',
      sourceLabel: catalogItem.name,
      name: resolveMonsterActionIdentity({
        action,
        equipment: args.monster.equipment,
        equipmentCatalog: args.equipmentCatalog,
        magicPropertyProvider: args.magicPropertyProvider,
        equipmentCatalogStatus: 'ready',
      }).displayName,
      governingAbility: governing.ability,
      proficiencyContribution: proficient ? args.proficiencyBonus : 0,
      attackBonus: totals.attackBonus,
      modes,
      ...(reach !== undefined ? { reach } : {}),
      ...(modes.includes('ranged') && catalogItem.range ? { range: catalogItem.range } : {}),
      primary,
      onHit: resolveOnHitEffects(
        action.onHit,
        propertyOnHitEffects(entry, catalogItem, args.magicPropertyProvider),
      ),
      weaponProperties: catalogItem.properties,
      unresolvedCapabilities: unresolvedWeaponCapabilities(catalogItem.properties),
    },
  }
}

// fallow-ignore-next-line complexity
function resolveNaturalProfile(
  action: Extract<ProfileAction, { kind: 'natural-weapon' }>,
  args: ResolveMonsterActionAttackProfileInput,
): DerivedField<MonsterActionAttackProfile> {
  if (args.proficiencyBonus === undefined) return unavailableField('missing-input')
  if (!hasDamageRoll(action.damage)) return unavailableField('missing-input')
  if (action.mode !== 'melee' && action.mode !== 'ranged') return unavailableField('missing-input')

  const properties = (action.properties ?? []) as readonly WeaponProperty[]
  const governing = governingAbility(
    { mode: action.mode, properties },
    args.monster.abilityScores ?? {},
  )
  if (!governing) return unavailableField('missing-input')

  const attackBonus = weaponAttackBonus(governing.modifier, true, args.proficiencyBonus)
  const primary = resolveStatBlockDamagePart(action.damage, governing.modifier)
  const named = resolveMonsterActionIdentity({ action, equipmentCatalogStatus: 'ready' })
  return {
    status: 'resolved',
    value: {
      sourceKind: 'natural-weapon',
      sourceLabel: named.defaultName || 'Natural weapon',
      name: named.displayName,
      governingAbility: governing.ability,
      proficiencyContribution: args.proficiencyBonus,
      attackBonus,
      modes: [action.mode],
      ...(action.mode === 'melee' ? { reach: action.reach ?? 5 } : {}),
      ...(action.range ? { range: action.range } : {}),
      primary: {
        expression: primary.expression,
        average: primary.average,
        damageTypeId: action.damageType ?? '',
      },
      onHit: resolveOnHitEffects(action.onHit, []),
      unresolvedCapabilities: [],
    },
  }
}

function abilityFromAttackEntry(entry: ProfileAction, entryId: string): Ability | undefined {
  if (entry.id !== entryId || entry.kind !== 'attack' || entry.bonusSource?.kind !== 'spell') {
    return undefined
  }
  const nested = entry.bonusSource.castingAbility
  if (nested?.kind === 'ability' && nested.ability) return nested.ability
  return undefined
}

function resolveSharedAbility(monster: ProfileMonster, entryId: string): Ability | undefined {
  const spell = findSpellCastingSource(monster, entryId)
  if (spell) return spell.ability
  const sections = [monster.actions, monster.bonusActions, monster.reactions] as const
  for (const section of sections) {
    for (const entry of section ?? []) {
      const ability = abilityFromAttackEntry(entry, entryId)
      if (ability) return ability
    }
  }
  return undefined
}

function resolveAuthoredAbility(
  action: Extract<ProfileAction, { kind: 'attack' }>,
  monster: ProfileMonster,
): { ability: Ability; proficient: boolean } | undefined {
  const source = action.bonusSource
  if (!source) return undefined
  if (source.kind === 'ability') {
    if (!source.ability || typeof source.proficient !== 'boolean') return undefined
    return { ability: source.ability, proficient: source.proficient }
  }
  const casting = source.castingAbility
  if (!casting) return undefined
  if (casting.kind === 'ability' && casting.ability) {
    return { ability: casting.ability, proficient: true }
  }
  if (casting.kind === 'shared' && casting.entryId) {
    const ability = resolveSharedAbility(monster, casting.entryId)
    if (!ability) return undefined
    return { ability, proficient: true }
  }
  return undefined
}

// fallow-ignore-next-line complexity
function resolveAuthoredProfile(
  action: Extract<ProfileAction, { kind: 'attack' }>,
  args: ResolveMonsterActionAttackProfileInput,
): DerivedField<MonsterActionAttackProfile> {
  if (args.proficiencyBonus === undefined) return unavailableField('missing-input')
  if (!hasDamageRoll(action.damage)) return unavailableField('missing-input')
  const ability = resolveAuthoredAbility(action, args.monster)
  if (!ability) return unavailableField('missing-input')
  const score = args.monster.abilityScores?.[ability.ability]
  if (typeof score !== 'number') return unavailableField('missing-input')

  const modifier = abilityModifier(score)
  const modes = action.modes ?? []
  const attackBonus = weaponAttackBonus(modifier, ability.proficient, args.proficiencyBonus)
  const primary = resolveStatBlockDamagePart(action.damage, modifier)
  return {
    status: 'resolved',
    value: {
      sourceKind: 'attack',
      sourceLabel: action.name?.trim() || 'Custom attack',
      name: resolveMonsterActionIdentity({ action, equipmentCatalogStatus: 'ready' }).displayName,
      governingAbility: ability.ability,
      proficiencyContribution: ability.proficient ? args.proficiencyBonus : 0,
      attackBonus,
      modes: [...modes],
      ...(modes.includes('melee') ? { reach: action.reach ?? 5 } : {}),
      ...(modes.includes('ranged') && action.range ? { range: action.range } : {}),
      primary: {
        expression: primary.expression,
        average: primary.average,
        damageTypeId: action.damageType ?? '',
      },
      onHit: resolveOnHitEffects(action.onHit, []),
      unresolvedCapabilities: [],
    },
  }
}

/**
 * Attack bonus, damage averages, and reach/range for one monster action.
 * Incomplete drafts are unavailable. This does not throw.
 * Versatile two-hand damage is not applied. A thrown melee weapon is one profile with both modes.
 */
export function resolveMonsterActionAttackProfile(
  args: ResolveMonsterActionAttackProfileInput,
): DerivedField<MonsterActionAttackProfile> {
  const { action } = args
  if (!isMonsterActionAttackKind(action.kind)) return unavailableField('missing-input')
  if (action.kind === 'weapon') return resolveWeaponProfile(action, args)
  if (action.kind === 'natural-weapon') return resolveNaturalProfile(action, args)
  if (action.kind === 'attack') return resolveAuthoredProfile(action, args)
  return unavailableField('missing-input')
}
