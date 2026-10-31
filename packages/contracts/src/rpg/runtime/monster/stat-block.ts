import type { MonsterAction, MonsterBody } from '../../content/monster'
import { getSkillName } from '../../content/skill-proficiency'
import { NEUTRAL_ABILITY_SCORE } from '../../vocab/ability'
import { CHALLENGE_RATING_MECHANICS } from '../../vocab/challenge-rating'
import { CREATURE_SIZE_HIT_DIE, resolveLargestCreatureSize } from '../../vocab/creature-size'
import type { ArmorClassRules } from '../../vocab/mechanics/armor-class-scale'
import { abilityModifier } from '../creature/ability-modifier'
import { spellAttackBonus, spellSaveDc } from '../creature/spell-dc'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import { resolveMonsterArmorClass, type MonsterArmorClassResolution } from './armor-class'
import { resolvePassivePerception, savingThrowBonus, skillModifier } from '../creature/checks'
import type { CreatureEquipmentCatalog } from '../creature/equipment'
import { resolveCreatureInitiativeModifier } from '../creature/initiative'
import type { CreatureSkillCatalog } from '../creature/proficiencies'
import { averageDiceRoll, type DieFace } from '../../primitives/dice'
import { averageStatBlockHitPoints, floorStatBlockAverage } from '../creature/stat-block-average'
import {
  requireDerivedField,
  resolvedField,
  unavailableField,
  type DerivedField,
} from './derived-field'
import { formatSignedModifier } from '../creature/weapon-attack'
import {
  attackProfileOnHitLabels,
  MONSTER_ACTION_ATTACK_KIND_SET,
  resolveMonsterActionAttackProfile,
  type MonsterActionAttackProfile,
  type ResolveMonsterActionAttackProfileInput,
} from './resolve-monster-action-attack-profile'

export type DerivedMonsterAttackLine = {
  id: string
  section: 'actions' | 'bonusActions' | 'reactions'
  name: string
  attackBonus: number
  attackBonusLabel: string
  damage: string
  damageExpression?: string
  damageTypeLabel: string
  additionalDamage?: Array<{
    expression: string
    average: number
    damageTypeLabel: string
  }>
  reach?: number
  range?: { normal: number; long?: number }
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
  spellcasting: DerivedMonsterSpellcastingLine[]
}

export type DerivedMonsterSpellcastingLine = {
  id: string
  section: 'actions' | 'bonusActions' | 'reactions'
  saveDc: number
  attackBonus: number
}

export type DeriveMonsterStatBlockInput = {
  monster: MonsterBody
  equipmentCatalog: CreatureEquipmentCatalog
  skillCatalog: CreatureSkillCatalog
  armorClassRules: ArmorClassRules
  magicPropertyProvider: MagicPropertyDefinitionProvider
}

function formatInitiativeLabel(modifier: number): string {
  return `${formatSignedModifier(modifier)} (${10 + modifier})`
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
  monster: Pick<MonsterBody, 'hitPoints' | 'sizes' | 'abilityScores'>,
): DerivedField<{ hp: number; formula: string; clampedToMinimum: boolean }> {
  const hitPoints = monster.hitPoints
  if (!hitPoints) return unavailableField('missing-input')

  if (hitPoints.kind === 'fixed') return resolveFixedHitPoints(hitPoints)

  if (hitPoints.count === undefined || hitPoints.count < 1) return unavailableField('missing-input')
  // Largest permitted size chooses the Hit Die. That matches the current SRD
  // stat blocks in this catalog. It is an application convention, not a claim
  // that every future creature derives hit points the same way. An instance
  // that later uses a smaller permitted size does not rewrite this formula.
  const largestSize = resolveLargestCreatureSize(monster.sizes ?? [])
  if (!largestSize || monster.abilityScores?.con === undefined)
    return unavailableField('missing-input')

  const dieFaces = CREATURE_SIZE_HIT_DIE[largestSize]
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

function attackLineFromProfile(
  profile: MonsterActionAttackProfile,
  id: string,
  section: DerivedMonsterAttackLine['section'],
): DerivedMonsterAttackLine {
  const onHit = attackProfileOnHitLabels(profile.onHit)
  return {
    id,
    section,
    name: profile.name,
    attackBonus: profile.attackBonus,
    attackBonusLabel: formatSignedModifier(profile.attackBonus),
    damage: String(profile.primary.average),
    ...(profile.primary.expression ? { damageExpression: profile.primary.expression } : {}),
    damageTypeLabel: profile.primary.damageTypeId,
    ...(onHit.length > 0 ? { additionalDamage: onHit } : {}),
    ...(profile.reach !== undefined ? { reach: profile.reach } : {}),
    ...(profile.range ? { range: profile.range } : {}),
  }
}

function appendAttackLines(
  target: DerivedMonsterAttackLine[],
  actions: readonly MonsterAction[],
  args: Omit<ResolveMonsterActionAttackProfileInput, 'action'>,
  section: DerivedMonsterAttackLine['section'],
): void {
  for (const action of actions) {
    if (!MONSTER_ACTION_ATTACK_KIND_SET.has(action.kind)) continue
    const profile = resolveMonsterActionAttackProfile({ ...args, action })
    if (profile.status !== 'resolved') {
      throw new Error(`Monster attack ${action.id} is unavailable.`)
    }
    target.push(attackLineFromProfile(profile.value, action.id, section))
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
    initiativeLabel: formatInitiativeLabel(initiativeModifier),
    proficiencyBonus,
    experiencePoints: resolveExperiencePoints(monster),
    passivePerception: resolvePassivePerception(perceptionMod),
    savingThrows,
    skills,
    attacks,
    spellcasting: deriveSpellcastingLines(monster, proficiencyBonus),
  }
}

function deriveSpellcastingLines(
  monster: MonsterBody,
  proficiencyBonus: number,
): DerivedMonsterSpellcastingLine[] {
  const sections = ['actions', 'bonusActions', 'reactions'] as const
  const spells = new Map<
    string,
    Extract<MonsterBody['actions'][number] | MonsterBody['reactions'][number], { kind: 'spell' }>
  >()
  for (const section of sections) {
    for (const action of monster[section]) {
      if (action.kind === 'spell') spells.set(action.id, action)
    }
  }
  const lines: DerivedMonsterSpellcastingLine[] = []
  for (const section of sections) {
    for (const action of monster[section]) {
      if (action.kind !== 'spell' || !action.castingAbility) continue
      const ability =
        action.castingAbility.kind === 'ability'
          ? action.castingAbility.ability
          : (() => {
              const target = spells.get(action.castingAbility.entryId)
              return target?.castingAbility?.kind === 'ability'
                ? target.castingAbility.ability
                : undefined
            })()
      if (!ability) continue
      const score = monster.abilityScores[ability]
      lines.push({
        id: action.id,
        section,
        saveDc: spellSaveDc(score, proficiencyBonus),
        attackBonus: spellAttackBonus(score, proficiencyBonus),
      })
    }
  }
  return lines
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
  sizes?: MonsterBody['sizes']
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
  const profile = resolveMonsterActionAttackProfile(args)
  if (profile.status === 'unavailable') return profile
  return resolvedField(attackLineFromProfile(profile.value, args.action.id, args.section))
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
          label: formatInitiativeLabel(resolveCreatureInitiativeModifier(dexScore)),
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
