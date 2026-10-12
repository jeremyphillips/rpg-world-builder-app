import { DEFAULT_ARMOR_CLASS_BASE } from '../../campaign/patches/campaign-mechanics-patch'
import { isArmorEquipment, isWeaponEquipment, type Equipment } from '../../content/equipment'
import type { MonsterAction, MonsterBody } from '../../content/monster'
import { getSkillName } from '../../content/skill-proficiency'
import { CHALLENGE_RATING_MECHANICS } from '../../vocab/challenge-rating'
import { CREATURE_SIZE_HIT_DIE } from '../../vocab/creature-size'
import type { ArmorClassBase } from '../../vocab/mechanics/edition-preset-mechanics'
import { abilityModifier } from '../creature/ability-modifier'
import {
  dexModifierForArmor,
  resolveEquippedArmorClass,
  toEquippedArmorPiece,
} from '../creature/armor-class'
import { resolvePassivePerception, savingThrowBonus, skillModifier } from '../creature/checks'
import type { CreatureEquipmentCatalog } from '../creature/equipment'
import { resolveCreatureInitiativeModifier } from '../creature/initiative'
import { isWeaponProficientFromGrantSet } from '../creature/proficiencies'
import type { CreatureSkillCatalog } from '../creature/proficiencies'
import { averageDiceRoll, type DieFace } from '../../primitives/dice'
import {
  averageStatBlockDamage,
  averageStatBlockHitPoints,
  floorStatBlockAverage,
} from '../creature/stat-block-average'
import {
  requireDerivedField,
  resolvedField,
  unavailableField,
  type DerivedField,
} from './derived-field'
import { getCreatureArmorClassKindLabel } from '../../vocab/creature-armor-class-kind'
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

export type MonsterArmorClassBodyContribution = {
  entryId: string
  label: string
  base: number
  dex: number
  maxDexBonus?: number
  adjustment: number
}

export type MonsterArmorClassShieldContribution = {
  entryId: string
  label: string
  acBonus: number
  adjustment: number
}

export type MonsterArmorClassBreakdown = {
  source: 'unarmored' | 'natural' | 'equipment' | 'fixed'
  label: string
  base: number
  appliedDex: number
  naturalBonus?: number
  fixedValue?: number
  bodyArmor?: MonsterArmorClassBodyContribution
  shields: MonsterArmorClassShieldContribution[]
}

export type DerivedMonsterStatBlock = {
  ac: number
  acBreakdown: MonsterArmorClassBreakdown
  hp: number
  hpFormula: string
  hpClampedToMinimum: boolean
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

type ArmorContributionRow = {
  entryId: string
  label: string
  item: Extract<Equipment, { kind: 'armor' }>
  piece: ReturnType<typeof toEquippedArmorPiece>
}

function equippedArmorRows(
  monster: Pick<MonsterBody, 'equipment'>,
  equipmentCatalog: CreatureEquipmentCatalog,
): ArmorContributionRow[] {
  return (monster.equipment ?? [])
    .filter((entry) => entry.equipped)
    .flatMap((entry) => {
      const item = equipmentCatalog.get(entry.equipmentId)
      if (!item || !isArmorEquipment(item)) return []
      return [
        {
          entryId: entry.entryId,
          label: entry.customName ?? item.name,
          item,
          piece: toEquippedArmorPiece(item, entry.modifiers),
        },
      ]
    })
}

function shieldContribution(row: ArmorContributionRow): MonsterArmorClassShieldContribution {
  return {
    entryId: row.entryId,
    label: row.label,
    acBonus: row.item.acBonus ?? 0,
    adjustment: row.piece.acAdjustment,
  }
}

export function resolveMonsterArmorClass(args: {
  monster: Pick<MonsterBody, 'armorClass' | 'equipment' | 'abilityScores'>
  equipmentCatalog: CreatureEquipmentCatalog
  acBase?: ArmorClassBase
}): DerivedField<{ ac: number; breakdown: MonsterArmorClassBreakdown }> {
  const { monster, equipmentCatalog } = args
  const acBase = args.acBase ?? DEFAULT_ARMOR_CLASS_BASE
  const armorClass = monster.armorClass
  if (!armorClass) return unavailableField('missing-input')

  const rows = equippedArmorRows(monster, equipmentCatalog)
  const { shields, bodyArmor } = partitionEquippedArmor(rows)
  const dexScore = monster.abilityScores?.dex
  const blocked = armorClassBlocker(armorClass, bodyArmor, dexScore)
  if (blocked) return blocked

  const dexModifier = dexScore === undefined ? 0 : abilityModifier(dexScore)
  const shieldEntries = shields.map(shieldContribution)
  if (armorClass.kind === 'fixed') return resolveFixedArmorClass(armorClass.value)

  return resolveVariableArmorClass({
    armorClass,
    rows,
    shields,
    bodyArmor,
    acBase,
    dexModifier,
    shieldEntries,
  })
}

function resolveVariableArmorClass(input: {
  armorClass: Exclude<MonsterBody['armorClass'], { kind: 'fixed' }>
  rows: ReturnType<typeof equippedArmorRows>
  shields: ReturnType<typeof equippedArmorRows>
  bodyArmor: ReturnType<typeof equippedArmorRows>
  acBase: ArmorClassBase
  dexModifier: number
  shieldEntries: MonsterArmorClassBreakdown['shields']
}): DerivedField<{ ac: number; breakdown: MonsterArmorClassBreakdown }> {
  const { armorClass, rows, shields, bodyArmor, acBase, dexModifier, shieldEntries } = input
  const naturalBonus = armorClass.kind === 'natural' ? armorClass.bonus : undefined
  const participating = armorClass.kind === 'equipment' ? rows : shields
  const shieldBonus = shields.reduce(
    (sum, row) => sum + (row.item.acBonus ?? 0) + row.piece.acAdjustment,
    0,
  )
  const ac =
    armorClass.kind === 'natural'
      ? acBase + dexModifier + (naturalBonus ?? 0) + shieldBonus
      : resolveEquippedArmorClass({
          acBase,
          dexModifier,
          equippedArmor: participating.map((row) => row.piece),
        })
  return resolvedField({
    ac,
    breakdown: armorClassBreakdown({
      kind: armorClass.kind,
      acBase,
      dexModifier,
      naturalBonus,
      selectedBody: armorClass.kind === 'equipment' ? bodyArmor[0] : undefined,
      shieldEntries,
    }),
  })
}

function armorClassBlocker(
  armorClass: MonsterBody['armorClass'],
  bodyArmor: ReturnType<typeof equippedArmorRows>,
  dexScore: number | undefined,
): DerivedField<{ ac: number; breakdown: MonsterArmorClassBreakdown }> | undefined {
  if (bodyArmor.length > 1) return unavailableField('conflict')
  if (armorClass.kind !== 'fixed' && dexScore === undefined)
    return unavailableField('missing-input')
  if (armorClass.kind === 'equipment' && bodyArmor.length === 0) {
    return unavailableField('missing-reference')
  }
  if (armorClass.kind === 'natural' && armorClass.bonus === undefined) {
    return unavailableField('missing-input')
  }
  return undefined
}

function partitionEquippedArmor(rows: ReturnType<typeof equippedArmorRows>): {
  shields: ReturnType<typeof equippedArmorRows>
  bodyArmor: ReturnType<typeof equippedArmorRows>
} {
  return {
    shields: rows.filter((row) => row.item.category === 'shields'),
    bodyArmor: rows.filter((row) => row.item.category !== 'shields'),
  }
}

function resolveFixedArmorClass(
  value: number | undefined,
): DerivedField<{ ac: number; breakdown: MonsterArmorClassBreakdown }> {
  if (value === undefined) return unavailableField('missing-input')
  return resolvedField({
    ac: value,
    breakdown: {
      source: 'fixed',
      label: getCreatureArmorClassKindLabel('fixed'),
      base: value,
      appliedDex: 0,
      fixedValue: value,
      shields: [],
    },
  })
}

function armorClassBreakdown(input: {
  kind: MonsterBody['armorClass']['kind']
  acBase: number
  dexModifier: number
  naturalBonus: number | undefined
  selectedBody: ReturnType<typeof equippedArmorRows>[number] | undefined
  shieldEntries: MonsterArmorClassBreakdown['shields']
}): MonsterArmorClassBreakdown {
  const { kind, acBase, dexModifier, naturalBonus, selectedBody, shieldEntries } = input
  const appliedDex = selectedBody
    ? dexModifierForArmor(dexModifier, selectedBody.piece)
    : dexModifier
  return {
    source: kind,
    label: getCreatureArmorClassKindLabel(kind),
    base: selectedBody?.item.baseAc ?? acBase,
    appliedDex,
    ...(naturalBonus !== undefined ? { naturalBonus } : {}),
    ...(selectedBody ? { bodyArmor: bodyArmorContribution(selectedBody, appliedDex) } : {}),
    shields: shieldEntries,
  }
}

function bodyArmorContribution(
  selectedBody: NonNullable<ReturnType<typeof equippedArmorRows>[number]>,
  appliedDex: number,
): NonNullable<MonsterArmorClassBreakdown['bodyArmor']> {
  return {
    entryId: selectedBody.entryId,
    label: selectedBody.label,
    base: selectedBody.item.baseAc ?? 0,
    dex: appliedDex,
    ...(selectedBody.item.maxDexBonus !== undefined
      ? { maxDexBonus: selectedBody.item.maxDexBonus }
      : {}),
    adjustment: selectedBody.piece.acAdjustment,
  }
}

function resolveFixedHitPoints(
  hitPoints: Extract<MonsterBody['hitPoints'], { kind: 'fixed' }>,
): DerivedField<{ hp: number; formula: string; clampedToMinimum: boolean }> {
  if (hitPoints.average === undefined) return unavailableField('missing-input')
  return resolvedField({
    hp: hitPoints.average,
    formula: hitPoints.formula ?? String(hitPoints.average),
    clampedToMinimum: false,
  })
}

export function resolveMonsterHitPoints(
  monster: Pick<MonsterBody, 'hitPoints' | 'size' | 'abilityScores'>,
): DerivedField<{ hp: number; formula: string; clampedToMinimum: boolean }> {
  const hitPoints = monster.hitPoints
  if (!hitPoints) return unavailableField('missing-input')

  if (hitPoints.kind === 'fixed') return resolveFixedHitPoints(hitPoints)

  if (hitPoints.count === undefined || hitPoints.count < 1) return unavailableField('missing-input')
  if (!monster.size || monster.abilityScores?.con === undefined)
    return unavailableField('missing-input')

  const dieFaces = CREATURE_SIZE_HIT_DIE[monster.size]
  const conMod = abilityModifier(monster.abilityScores.con)
  const conTotal = hitPoints.count * conMod
  const averageDie = averageDiceRoll({ count: hitPoints.count, faces: dieFaces as DieFace })
  const unclamped = floorStatBlockAverage(averageDie + conTotal)
  const hp = averageStatBlockHitPoints({
    hitDieFaces: dieFaces,
    hitDiceCount: hitPoints.count,
    conModifier: conMod,
  })
  const formula =
    conTotal === 0
      ? `${hitPoints.count}d${dieFaces}`
      : `${hitPoints.count}d${dieFaces} ${formatSignedModifier(conTotal)}`
  return resolvedField({
    hp,
    formula,
    clampedToMinimum: hp === 1 && unclamped < 1,
  })
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
  return {
    ...(weapon.mode === 'melee' ? { reach: 5 } : {}),
    ...(weapon.range ? { range: weapon.range } : {}),
  }
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
    isWeaponProficientFromGrantSet(catalogItem, monster.proficiencies.weapons),
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
    if (action.kind === 'special') continue
    const line = resolveWeaponAttackLine({ ...args, action, section })
    if (!line) {
      throw new Error(`Monster attack ${action.id} is unavailable.`)
    }
    if (section === 'reactions' && 'trigger' in action && typeof action.trigger === 'string') {
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
  const proficiencyBonus = CHALLENGE_RATING_MECHANICS[monster.challengeRating].proficiencyBonus

  const armor = requireDerivedField(
    'armorClass',
    resolveMonsterArmorClass({ monster, equipmentCatalog, acBase }),
  )
  const hitPoints = requireDerivedField('hitPoints', resolveMonsterHitPoints(monster))
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
    ac: armor.ac,
    acBreakdown: armor.breakdown,
    hp: hitPoints.hp,
    hpFormula: hitPoints.formula,
    hpClampedToMinimum: hitPoints.clampedToMinimum,
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

export type DerivedDraftAttack = {
  id: string
  section: DerivedMonsterAttackLine['section']
  result: DerivedField<DerivedMonsterAttackLine>
}

export type DerivedMonsterDraftStatBlock = {
  ac: DerivedField<{ ac: number; breakdown: MonsterArmorClassBreakdown }>
  hp: DerivedField<{ hp: number; formula: string; clampedToMinimum: boolean }>
  initiative: DerivedField<{ modifier: number; label: string }>
  challenge: DerivedField<{ experiencePoints: number; proficiencyBonus: number }>
  passivePerception: DerivedField<number>
  savingThrows: DerivedField<DerivedMonsterStatBlock['savingThrows']>
  skills: DerivedField<DerivedMonsterStatBlock['skills']>
  attacks: DerivedDraftAttack[]
}

type DraftMonsterSource = {
  size?: MonsterBody['size']
  abilityScores?: Partial<MonsterBody['abilityScores']>
  armorClass?: MonsterBody['armorClass']
  hitPoints?: MonsterBody['hitPoints']
  challengeRating?: MonsterBody['challengeRating']
  experiencePointsOverride?: number
  equipment?: MonsterBody['equipment']
  proficiencies?: MonsterBody['proficiencies']
  actions?: MonsterAction[]
  bonusActions?: MonsterAction[]
  reactions?: MonsterAction[]
}

function draftAttackResult(args: {
  action: MonsterAction
  monster: MonsterBody
  equipmentCatalog: CreatureEquipmentCatalog
  proficiencyBonus: number | undefined
  section: DerivedMonsterAttackLine['section']
}): DerivedField<DerivedMonsterAttackLine> {
  if (args.proficiencyBonus === undefined) return unavailableField('missing-input')
  if (args.action.kind === 'natural-weapon' && !args.action.damage)
    return unavailableField('missing-input')
  if (args.action.kind === 'weapon' && !args.action.equipmentEntryId) {
    return unavailableField('missing-reference')
  }
  const line = resolveWeaponAttackLine({
    action: args.action,
    monster: args.monster,
    equipmentCatalog: args.equipmentCatalog,
    proficiencyBonus: args.proficiencyBonus,
    section: args.section,
  })
  if (!line) {
    return unavailableField(args.action.kind === 'weapon' ? 'missing-reference' : 'missing-input')
  }
  return resolvedField(line)
}

function draftAttacks(
  monster: DraftMonsterSource,
  asBody: MonsterBody,
  equipmentCatalog: CreatureEquipmentCatalog,
  proficiencyBonus: number | undefined,
): DerivedDraftAttack[] {
  const sections = [
    ['actions', monster.actions ?? []],
    ['bonusActions', monster.bonusActions ?? []],
    ['reactions', monster.reactions ?? []],
  ] as const
  const attacks: DerivedDraftAttack[] = []
  for (const [section, actions] of sections) {
    for (const action of actions) {
      if (action.kind === 'special') continue
      attacks.push({
        id: action.id,
        section,
        result: draftAttackResult({
          action,
          monster: asBody,
          equipmentCatalog,
          proficiencyBonus,
          section,
        }),
      })
    }
  }
  return attacks
}

function draftSavingThrows(
  monster: DraftMonsterSource,
  mechanics:
    | (typeof CHALLENGE_RATING_MECHANICS)[keyof typeof CHALLENGE_RATING_MECHANICS]
    | undefined,
): DerivedField<DerivedMonsterStatBlock['savingThrows']> {
  if (!mechanics) return unavailableField('missing-input')
  return resolvedField(
    Object.fromEntries(
      (monster.proficiencies?.savingThrows ?? []).map((ability) => [
        ability,
        savingThrowBonus(monster.abilityScores?.[ability] ?? 10, true, mechanics.proficiencyBonus),
      ]),
    ),
  )
}

function draftSkills(
  monster: DraftMonsterSource,
  skillCatalog: CreatureSkillCatalog,
  mechanics:
    | (typeof CHALLENGE_RATING_MECHANICS)[keyof typeof CHALLENGE_RATING_MECHANICS]
    | undefined,
): DerivedField<DerivedMonsterStatBlock['skills']> {
  if (!mechanics) return unavailableField('missing-input')
  return resolvedField(
    (monster.proficiencies?.skills ?? []).map((entry) => {
      const skillRow = skillCatalog.get(entry.skill)
      const abilityScore = skillRow
        ? (monster.abilityScores?.[skillRow.ability] ?? 10)
        : (monster.abilityScores?.wis ?? 10)
      return {
        skillId: entry.skill,
        label: skillRow?.name ?? getSkillName(entry.skill),
        modifier: skillModifier(abilityScore, entry.rank, mechanics.proficiencyBonus),
      }
    }),
  )
}

function draftPassivePerception(
  monster: DraftMonsterSource,
  skillCatalog: CreatureSkillCatalog,
  mechanics:
    | (typeof CHALLENGE_RATING_MECHANICS)[keyof typeof CHALLENGE_RATING_MECHANICS]
    | undefined,
): DerivedField<number> {
  const wisScore = monster.abilityScores?.wis
  if (!mechanics || wisScore === undefined) return unavailableField('missing-input')
  const perceptionRank = monster.proficiencies?.skills.find(
    (entry) => entry.skill === 'perception',
  )?.rank
  const perceptionSkill = skillCatalog.get('perception')
  const modifier =
    perceptionSkill != null
      ? skillModifier(wisScore, perceptionRank, mechanics.proficiencyBonus)
      : abilityModifier(wisScore)
  return resolvedField(resolvePassivePerception(modifier))
}

/** Draft derivation over the same resolvers. Incomplete input is unavailable, not thrown. */
export function deriveMonsterDraftStatBlock(args: {
  monster: DraftMonsterSource
  equipmentCatalog: CreatureEquipmentCatalog
  skillCatalog: CreatureSkillCatalog
  acBase?: ArmorClassBase
}): DerivedMonsterDraftStatBlock {
  const { monster, equipmentCatalog, skillCatalog, acBase } = args
  const dexScore = monster.abilityScores?.dex
  const initiative =
    dexScore === undefined
      ? unavailableField<{ modifier: number; label: string }>('missing-input')
      : resolvedField({
          modifier: resolveCreatureInitiativeModifier(dexScore),
          label: formatInitiativeLabel(resolveCreatureInitiativeModifier(dexScore), dexScore),
        })

  const challengeRating = monster.challengeRating
  const mechanics = challengeRating ? CHALLENGE_RATING_MECHANICS[challengeRating] : undefined
  const challenge = mechanics
    ? resolvedField({
        experiencePoints: monster.experiencePointsOverride ?? mechanics.xp,
        proficiencyBonus: mechanics.proficiencyBonus,
      })
    : unavailableField<{ experiencePoints: number; proficiencyBonus: number }>('missing-input')

  const asBody = monster as MonsterBody
  const attacks = draftAttacks(monster, asBody, equipmentCatalog, mechanics?.proficiencyBonus)
  const savingThrows = draftSavingThrows(monster, mechanics)
  const skills = draftSkills(monster, skillCatalog, mechanics)
  const passivePerception = draftPassivePerception(monster, skillCatalog, mechanics)

  return {
    ac: resolveMonsterArmorClass({ monster: asBody, equipmentCatalog, acBase }),
    hp: resolveMonsterHitPoints(asBody),
    initiative,
    challenge,
    passivePerception,
    savingThrows,
    skills,
    attacks,
  }
}

export { formatWeaponDamageWithModifier }
