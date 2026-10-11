import { DEFAULT_ARMOR_CLASS_BASE } from '../../campaign/patches/campaign-mechanics-patch'
import { isArmorEquipment, isWeaponEquipment, type Equipment } from '../../content/equipment'
import type { MonsterAction, MonsterBody } from '../../content/monster'
import { getSkillName } from '../../content/skill-proficiency'
import { CHALLENGE_RATING_MECHANICS } from '../../vocab/challenge-rating'
import { CREATURE_SIZE_HIT_DIE } from '../../vocab/creature-size'
import type { ArmorClassBase } from '../../vocab/mechanics/edition-preset-mechanics'
import { abilityModifier } from '../creature/ability-modifier'
import { resolveEquippedArmorClass, toEquippedArmorPiece } from '../creature/armor-class'
import { resolvePassivePerception, savingThrowBonus, skillModifier } from '../creature/checks'
import type { CreatureEquipmentCatalog } from '../creature/equipment'
import { resolveCreatureInitiativeModifier } from '../creature/initiative'
import { isWeaponProficient } from '../creature/proficiencies'
import type { CreatureSkillCatalog } from '../creature/proficiencies'
import { averageStatBlockDamage, averageStatBlockHitPoints } from '../creature/stat-block-average'
import {
  formatSignedModifier,
  formatWeaponDamageWithModifier,
  resolveWeaponAttackAbilityModifier,
  weaponAttackBonus,
} from '../creature/weapon-attack'

export type DerivedMonsterAttackLine = {
  id: string
  section: 'actions' | 'bonusActions' | 'reactions'
  name: string
  attackBonus: number
  attackBonusLabel: string
  damage: string
  damageTypeLabel: string
  reach?: number
  range?: { normal: number; long?: number }
  trigger?: string
}

export type DerivedMonsterStatBlock = {
  ac: number
  acBreakdown: string
  hp: number
  hpFormula: string
  initiativeModifier: number
  initiativeLabel: string
  proficiencyBonus: number
  experiencePoints: number
  passivePerception: number
  savingThrows: Partial<Record<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha', number>>
  skills: Array<{ skillId: string; label: string; modifier: number }>
  attacks: DerivedMonsterAttackLine[]
}

export type DeriveMonsterStatBlockInput = {
  monster: MonsterBody
  equipmentCatalog: CreatureEquipmentCatalog
  skillCatalog: CreatureSkillCatalog
  acBase?: ArmorClassBase
}

function formatInitiativeLabel(modifier: number, dexScore: number): string {
  return `${formatSignedModifier(modifier)} (${dexScore})`
}

function resolveMonsterAc(args: {
  monster: MonsterBody
  equipmentCatalog: CreatureEquipmentCatalog
  dexModifier: number
  acBase: ArmorClassBase
}): { ac: number; breakdown: string } {
  const { monster, equipmentCatalog, dexModifier, acBase } = args
  const armorClass = monster.armorClass

  switch (armorClass.kind) {
    case 'fixed':
      return { ac: armorClass.value, breakdown: `fixed ${armorClass.value}` }
    case 'natural':
      return {
        ac: acBase + dexModifier + armorClass.bonus,
        breakdown: `natural +${armorClass.bonus}, DEX ${formatSignedModifier(dexModifier)}`,
      }
    case 'equipment': {
      const pieces = monster.equipment
        .filter((entry) => entry.equipped)
        .flatMap((entry) => {
          const item = equipmentCatalog.get(entry.equipmentId)
          return item && isArmorEquipment(item) ? [toEquippedArmorPiece(item, entry.modifiers)] : []
        })
      const ac = resolveEquippedArmorClass({ acBase, dexModifier, equippedArmor: pieces })
      return { ac, breakdown: 'equipment' }
    }
    case 'unarmored':
    default: {
      const shields = monster.equipment
        .filter((entry) => entry.equipped)
        .flatMap((entry) => {
          const item = equipmentCatalog.get(entry.equipmentId)
          return item && isArmorEquipment(item) && item.category === 'shields'
            ? [toEquippedArmorPiece(item, entry.modifiers)]
            : []
        })
      const ac = resolveEquippedArmorClass({
        acBase,
        dexModifier,
        equippedArmor: shields,
      })
      return { ac, breakdown: `unarmored, DEX ${formatSignedModifier(dexModifier)}` }
    }
  }
}

function resolveMonsterHp(monster: MonsterBody): { hp: number; formula: string } {
  const hitPoints = monster.hitPoints
  if (hitPoints.kind === 'fixed') {
    return {
      hp: hitPoints.average,
      formula: hitPoints.formula ?? String(hitPoints.average),
    }
  }

  const dieFaces = CREATURE_SIZE_HIT_DIE[monster.size]
  const conMod = abilityModifier(monster.abilityScores.con)
  const hp = averageStatBlockHitPoints({
    hitDieFaces: dieFaces,
    hitDiceCount: hitPoints.count,
    conModifier: conMod,
  })
  const signedCon = formatSignedModifier(conMod)
  const formula =
    conMod === 0 ? `${hitPoints.count}d${dieFaces}` : `${hitPoints.count}d${dieFaces} ${signedCon}`
  return { hp, formula }
}

function resolveExperiencePoints(monster: MonsterBody): number {
  const derived = CHALLENGE_RATING_MECHANICS[monster.challengeRating].xp
  if (monster.experiencePointsOverride !== undefined) {
    return monster.experiencePointsOverride
  }
  return derived
}

function weaponActionReachRange(
  weapon: Extract<Equipment, { kind: 'weapon' }>,
): Pick<DerivedMonsterAttackLine, 'reach' | 'range'> {
  if (weapon.mode === 'melee') return { reach: 5 }
  return weapon.range ? { range: weapon.range } : {}
}

function resolveCatalogWeaponAttackLine(args: {
  action: Extract<MonsterAction, { kind: 'weapon' }>
  monster: MonsterBody
  equipmentCatalog: CreatureEquipmentCatalog
  proficiencyBonus: number
  section: DerivedMonsterAttackLine['section']
}): DerivedMonsterAttackLine | undefined {
  const { action, monster, equipmentCatalog, proficiencyBonus, section } = args
  const entry = monster.equipment.find((row) => row.entryId === action.equipmentEntryId)
  const catalogItem = entry ? equipmentCatalog.get(entry.equipmentId) : undefined
  if (!catalogItem || !isWeaponEquipment(catalogItem)) return undefined

  const abilityMod = resolveWeaponAttackAbilityModifier(catalogItem, monster.abilityScores)
  if (abilityMod === undefined) return undefined

  const attackBonusValue = weaponAttackBonus(
    abilityMod,
    isWeaponProficient(catalogItem, monster.proficiencies.weapons),
    proficiencyBonus,
  )

  return {
    id: action.id,
    section,
    name: action.name ?? entry?.customName ?? catalogItem.name,
    attackBonus: attackBonusValue,
    attackBonusLabel: formatSignedModifier(attackBonusValue),
    damage: String(
      averageStatBlockDamage(
        catalogItem.damage ?? { dice: { count: 1, faces: 4 as const } },
        abilityMod,
      ),
    ),
    damageTypeLabel: catalogItem.damageType ?? '',
    ...weaponActionReachRange(catalogItem),
  }
}

function resolveNaturalWeaponAttackLine(args: {
  action: Extract<MonsterAction, { kind: 'natural-weapon' }>
  monster: MonsterBody
  proficiencyBonus: number
  section: DerivedMonsterAttackLine['section']
}): DerivedMonsterAttackLine | undefined {
  const { action, monster, proficiencyBonus, section } = args
  const abilityMod = resolveWeaponAttackAbilityModifier(
    { mode: action.mode, properties: [...action.properties] },
    monster.abilityScores,
  )
  if (abilityMod === undefined) return undefined

  const attackBonusValue = weaponAttackBonus(abilityMod, true, proficiencyBonus)

  return {
    id: action.id,
    section,
    name: action.name,
    attackBonus: attackBonusValue,
    attackBonusLabel: formatSignedModifier(attackBonusValue),
    damage: String(averageStatBlockDamage(action.damage, abilityMod)),
    damageTypeLabel: action.damageType,
    ...(action.mode === 'melee' ? { reach: action.reach ?? 5 } : {}),
    ...(action.range ? { range: action.range } : {}),
  }
}

function resolveWeaponAttackLine(args: {
  action: MonsterAction
  monster: MonsterBody
  equipmentCatalog: CreatureEquipmentCatalog
  proficiencyBonus: number
  section: DerivedMonsterAttackLine['section']
}): DerivedMonsterAttackLine | undefined {
  const { action, monster, equipmentCatalog, proficiencyBonus, section } = args
  if (action.kind === 'weapon') {
    return resolveCatalogWeaponAttackLine({
      action,
      monster,
      equipmentCatalog,
      proficiencyBonus,
      section,
    })
  }
  if (action.kind === 'natural-weapon') {
    return resolveNaturalWeaponAttackLine({ action, monster, proficiencyBonus, section })
  }
  return undefined
}

function appendAttackLines(
  target: DerivedMonsterAttackLine[],
  actions: readonly MonsterAction[],
  args: Omit<Parameters<typeof resolveWeaponAttackLine>[0], 'action' | 'section'>,
  section: DerivedMonsterAttackLine['section'],
): void {
  for (const action of actions) {
    const line = resolveWeaponAttackLine({ ...args, action, section })
    if (!line) continue
    if (
      section === 'reactions' &&
      action.kind !== 'special' &&
      'trigger' in action &&
      action.trigger
    ) {
      target.push({ ...line, trigger: action.trigger })
      continue
    }
    target.push(line)
  }
}

export function deriveMonsterStatBlock({
  monster,
  equipmentCatalog,
  skillCatalog,
  acBase = DEFAULT_ARMOR_CLASS_BASE,
}: DeriveMonsterStatBlockInput): DerivedMonsterStatBlock {
  const dexScore = monster.abilityScores.dex
  const dexModifier = abilityModifier(dexScore)
  const proficiencyBonus = CHALLENGE_RATING_MECHANICS[monster.challengeRating].proficiencyBonus

  const { ac, breakdown } = resolveMonsterAc({
    monster,
    equipmentCatalog,
    dexModifier,
    acBase,
  })

  const { hp, formula } = resolveMonsterHp(monster)
  const initiativeModifier = resolveCreatureInitiativeModifier(dexScore)

  const perceptionSkill = skillCatalog.get('perception')
  const perceptionRank = monster.proficiencies.skills.find(
    (entry) => entry.skill === 'perception',
  )?.rank
  const wisScore = monster.abilityScores.wis
  const perceptionMod =
    perceptionSkill != null
      ? skillModifier(wisScore, perceptionRank, proficiencyBonus)
      : abilityModifier(wisScore)

  const savingThrows: DerivedMonsterStatBlock['savingThrows'] = {}
  for (const ability of monster.proficiencies.savingThrows) {
    savingThrows[ability] = savingThrowBonus(monster.abilityScores[ability], true, proficiencyBonus)
  }

  const skills = monster.proficiencies.skills.map((entry) => {
    const skillRow = skillCatalog.get(entry.skill)
    const abilityScore = skillRow
      ? monster.abilityScores[skillRow.ability]
      : monster.abilityScores.wis
    return {
      skillId: entry.skill,
      label: skillRow?.name ?? getSkillName(entry.skill),
      modifier: skillModifier(abilityScore, entry.rank, proficiencyBonus),
    }
  })

  const attacks: DerivedMonsterAttackLine[] = []
  const attackLineArgs = { monster, equipmentCatalog, proficiencyBonus }
  appendAttackLines(attacks, monster.actions, attackLineArgs, 'actions')
  appendAttackLines(attacks, monster.bonusActions, attackLineArgs, 'bonusActions')
  appendAttackLines(attacks, monster.reactions, attackLineArgs, 'reactions')

  return {
    ac,
    acBreakdown: breakdown,
    hp,
    hpFormula: formula,
    initiativeModifier,
    initiativeLabel: formatInitiativeLabel(initiativeModifier, dexScore),
    proficiencyBonus,
    experiencePoints: resolveExperiencePoints(monster),
    passivePerception: resolvePassivePerception(perceptionMod),
    savingThrows,
    skills,
    attacks,
  }
}

export { formatWeaponDamageWithModifier }
