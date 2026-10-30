import { isWeaponEquipment, type Equipment } from '../../content/equipment'
import type { MonsterAction, MonsterBody } from '../../content/monster'
import { getSkillName } from '../../content/skill-proficiency'
import { NEUTRAL_ABILITY_SCORE } from '../../vocab/ability'
import { CHALLENGE_RATING_MECHANICS } from '../../vocab/challenge-rating'
import { CREATURE_SIZE_HIT_DIE } from '../../vocab/creature-size'
import type { ArmorClassRules } from '../../vocab/mechanics/armor-class-scale'
import { abilityModifier } from '../creature/ability-modifier'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import { resolveMonsterArmorClass, type MonsterArmorClassResolution } from './armor-class'
import { resolveInventoryWeaponAttackTotals } from '../creature/resolve-inventory-weapon-attack'
import { resolvePassivePerception, savingThrowBonus, skillModifier } from '../creature/checks'
import type { CreatureEquipmentCatalog } from '../creature/equipment'
import { resolveCreatureInitiativeModifier } from '../creature/initiative'
import { isWeaponProficient } from '../creature/proficiencies'
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
  ac: DerivedField<MonsterArmorClassResolution>
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
  armorClassRules: ArmorClassRules
  magicPropertyProvider: MagicPropertyDefinitionProvider
}

function formatInitiativeLabel(modifier: number, dexScore: number): string {
  return `${formatSignedModifier(modifier)} (${dexScore})`
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

function catalogWeaponForAction(
  monster: MonsterBody,
  equipmentCatalog: CreatureEquipmentCatalog,
  equipmentEntryId: string,
) {
  const entry = monster.equipment.find((row) => row.entryId === equipmentEntryId)
  if (!entry) return undefined
  const catalogItem = equipmentCatalog.get(entry.equipmentId)
  if (!catalogItem || !isWeaponEquipment(catalogItem)) return undefined
  return { entry, catalogItem }
}

function resolveCatalogWeaponAttackLine(args: {
  action: Extract<MonsterAction, { kind: 'weapon' }>
  monster: MonsterBody
  equipmentCatalog: CreatureEquipmentCatalog
  proficiencyBonus: number
  section: DerivedMonsterAttackLine['section']
  magicPropertyProvider: MagicPropertyDefinitionProvider
}): DerivedMonsterAttackLine | undefined {
  const { action, monster, equipmentCatalog, proficiencyBonus, section, magicPropertyProvider } =
    args
  const resolved = catalogWeaponForAction(monster, equipmentCatalog, action.equipmentEntryId)
  if (!resolved) return undefined
  const { entry, catalogItem } = resolved

  const abilityMod = resolveWeaponAttackAbilityModifier(catalogItem, monster.abilityScores)
  if (abilityMod === undefined) return undefined

  const totals = resolveInventoryWeaponAttackTotals({
    entry,
    item: catalogItem,
    abilityModifier: abilityMod,
    proficient: isWeaponProficient(catalogItem, monster.proficiencies.weapons),
    proficiencyBonus,
    provider: magicPropertyProvider,
  })
  if (totals?.attackBonus === undefined || totals.damageAverage === undefined) return undefined

  return {
    id: action.id,
    section,
    name: action.name ?? entry?.customName ?? catalogItem.name,
    attackBonus: totals.attackBonus,
    attackBonusLabel: formatSignedModifier(totals.attackBonus),
    damage: String(totals.damageAverage),
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
  magicPropertyProvider: MagicPropertyDefinitionProvider
}): DerivedMonsterAttackLine | undefined {
  const { action, monster, equipmentCatalog, proficiencyBonus, section, magicPropertyProvider } =
    args
  if (action.kind === 'weapon') {
    return resolveCatalogWeaponAttackLine({
      action,
      monster,
      equipmentCatalog,
      proficiencyBonus,
      section,
      magicPropertyProvider,
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
  armorClassRules,
  magicPropertyProvider,
}: DeriveMonsterStatBlockInput): DerivedMonsterStatBlock {
  const dexScore = monster.abilityScores.dex
  const proficiencyBonus = CHALLENGE_RATING_MECHANICS[monster.challengeRating].proficiencyBonus

  const armor = resolveMonsterArmorClass({
    monster,
    equipmentCatalog,
    armorClassRules,
    magicPropertyProvider,
  })
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
  const attackLineArgs = { monster, equipmentCatalog, proficiencyBonus, magicPropertyProvider }
  appendAttackLines(attacks, monster.actions, attackLineArgs, 'actions')
  appendAttackLines(attacks, monster.bonusActions, attackLineArgs, 'bonusActions')
  appendAttackLines(attacks, monster.reactions, attackLineArgs, 'reactions')

  return {
    ac: armor,
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
  ac: DerivedField<MonsterArmorClassResolution>
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
  magicPropertyProvider: MagicPropertyDefinitionProvider
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
    magicPropertyProvider: args.magicPropertyProvider,
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
  magicPropertyProvider: MagicPropertyDefinitionProvider,
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
          magicPropertyProvider,
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
        savingThrowBonus(
          monster.abilityScores?.[ability] ?? NEUTRAL_ABILITY_SCORE,
          true,
          mechanics.proficiencyBonus,
        ),
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
        ? (monster.abilityScores?.[skillRow.ability] ?? NEUTRAL_ABILITY_SCORE)
        : (monster.abilityScores?.wis ?? NEUTRAL_ABILITY_SCORE)
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
  armorClassRules: ArmorClassRules
  magicPropertyProvider: MagicPropertyDefinitionProvider
}): DerivedMonsterDraftStatBlock {
  const { monster, equipmentCatalog, skillCatalog, armorClassRules, magicPropertyProvider } = args
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
  const attacks = draftAttacks(
    monster,
    asBody,
    equipmentCatalog,
    mechanics?.proficiencyBonus,
    magicPropertyProvider,
  )
  const savingThrows = draftSavingThrows(monster, mechanics)
  const skills = draftSkills(monster, skillCatalog, mechanics)
  const passivePerception = draftPassivePerception(monster, skillCatalog, mechanics)

  return {
    ac: resolveMonsterArmorClass({
      monster: asBody,
      equipmentCatalog,
      armorClassRules,
      magicPropertyProvider,
    }),
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
