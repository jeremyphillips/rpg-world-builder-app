import {
  ABILITY_IDS,
  abilityModifier,
  formatSignedModifier,
  getAbilityCompactLabel,
  getChallengeRatingLabel,
  getCreatureSizeLabel,
  getDamageTypeLabel,
  getEffectConditionLabel,
  getLanguageLabel,
  joinInlineMetadata,
  formatMovementDisplay,
  type Equipment,
  type Monster,
  type MonsterAction,
  type MonsterReaction,
  type SkillProficiency,
  deriveMonsterStatBlock,
  type DerivedMonsterAttackLine,
  type DerivedMonsterStatBlock,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'

export const MONSTER_UNRESOLVED_CATALOG_REFERENCE = 'Unresolved reference'

export type MonsterCatalogLoadState = 'pending' | 'ready' | 'error'

export type MonsterAbilityRow = {
  ability: (typeof ABILITY_IDS)[number]
  score: number
  modifierLabel: string
  saveLabel: string
  saveProficient: boolean
}

export type MonsterActionItemViewModel = {
  id: string
  name: string
  attackLine?: string
  triggerLine?: string
  descriptionHtml?: string
}

export type MonsterTraitItemViewModel = {
  id: string
  name: string
  descriptionHtml: string
}

export type MonsterGearLineViewModel = {
  entryId: string
  primary: string
  secondary?: string
}

export type MonsterDetailsLeafViewModel = {
  id: string
  label: string
  body: string
}

export type MonsterDetailViewModel = {
  classificationLabel: string
  catalogState: MonsterCatalogLoadState
  statRows: ContentStatRowData[]
  abilities: MonsterAbilityRow[]
  detailsLeaves: MonsterDetailsLeafViewModel[]
  traits: MonsterTraitItemViewModel[]
  actions: MonsterActionItemViewModel[]
  bonusActions: MonsterActionItemViewModel[]
  reactions: MonsterActionItemViewModel[]
}

export type BuildMonsterDetailViewModelInput = {
  monster: Monster
  creatureTypeLabel: string
  equipmentById: Map<string, Equipment>
  catalogState: MonsterCatalogLoadState
  derived?: DerivedMonsterStatBlock | null
}

function formatAcSource(monster: Monster, equipmentById: Map<string, Equipment>): string {
  switch (monster.armorClass.kind) {
    case 'natural':
      return 'natural armor'
    case 'fixed':
      return 'fixed'
    case 'equipment': {
      const names = monster.equipment
        .filter((entry) => entry.equipped)
        .map((entry) => {
          const item = equipmentById.get(entry.equipmentId)
          return entry.customName ?? item?.name
        })
        .filter(Boolean)
      return names.length > 0 ? names.join(', ') : 'equipment'
    }
    case 'unarmored':
    default:
      return 'unarmored'
  }
}

function formatAcStatRow(
  monster: Monster,
  derived: DerivedMonsterStatBlock,
  equipmentById: Map<string, Equipment>,
): ContentStatRowData {
  const source = formatAcSource(monster, equipmentById)
  return {
    id: 'ac',
    label: 'AC',
    value: joinInlineMetadata([String(derived.ac), source]) || String(derived.ac),
  }
}

function formatHpStatRow(derived: DerivedMonsterStatBlock): ContentStatRowData {
  return {
    id: 'hp',
    label: 'HP',
    value: joinInlineMetadata([String(derived.hp), derived.hpFormula]) || String(derived.hp),
  }
}

function formatSpeedStatRow(monster: Monster): ContentStatRowData {
  const movement = formatMovementDisplay(monster.movement)
  const hoverSuffix = monster.hover ? '(hover)' : undefined
  return {
    id: 'speed',
    label: 'Speed',
    value: joinInlineMetadata([movement, hoverSuffix]) || movement,
  }
}

function formatCrStatRow(monster: Monster, derived: DerivedMonsterStatBlock): ContentStatRowData {
  const crLabel = getChallengeRatingLabel(monster.challengeRating)
  const xpPart = `XP ${derived.experiencePoints}`
  const pbPart = `PB ${formatSignedModifier(derived.proficiencyBonus)}`
  return {
    id: 'cr',
    label: 'CR',
    value: joinInlineMetadata([crLabel, xpPart, pbPart]) || crLabel,
  }
}

function buildAbilityRows(monster: Monster, derived: DerivedMonsterStatBlock): MonsterAbilityRow[] {
  return ABILITY_IDS.map((ability) => {
    const score = monster.abilityScores[ability]
    const mod = abilityModifier(score)
    const save = derived.savingThrows[ability]
    const saveProficient = save !== undefined
    return {
      ability,
      score,
      modifierLabel: formatSignedModifier(mod),
      saveLabel: saveProficient ? formatSignedModifier(save) : formatSignedModifier(mod),
      saveProficient,
    }
  })
}

function formatAttackLine(line: DerivedMonsterAttackLine): string {
  const reachPart =
    line.reach != null
      ? `reach ${line.reach} ft.`
      : line.range
        ? `range ${line.range.normal}/${line.range.long ?? '—'} ft.`
        : undefined
  const hitPart = joinInlineMetadata([`${line.attackBonusLabel} to hit`, reachPart, 'one target'])
  const damagePart = `Hit: ${line.damage} ${line.damageTypeLabel} damage`
  return joinInlineMetadata([hitPart, damagePart]) || line.name
}

function findAttackLine(
  derived: DerivedMonsterStatBlock | null | undefined,
  section: DerivedMonsterAttackLine['section'],
  actionId: string,
): DerivedMonsterAttackLine | undefined {
  return derived?.attacks.find((line) => line.section === section && line.id === actionId)
}

function mapActionItems(
  actions: readonly MonsterAction[],
  section: DerivedMonsterAttackLine['section'],
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
): MonsterActionItemViewModel[] {
  return actions.map((action) => {
    const name =
      action.kind === 'special'
        ? action.name
        : action.kind === 'natural-weapon'
          ? action.name
          : (action.name ?? action.id)

    if (action.kind === 'special') {
      return {
        id: action.id,
        name,
        descriptionHtml: action.description,
      }
    }

    const attack = findAttackLine(derived, section, action.id)
    let attackLine: string | undefined
    if (catalogState === 'ready' && attack) {
      attackLine = formatAttackLine(attack)
    } else if (catalogState === 'error' || (catalogState === 'ready' && !attack)) {
      attackLine = MONSTER_UNRESOLVED_CATALOG_REFERENCE
    }

    return {
      id: action.id,
      name,
      attackLine,
      descriptionHtml: action.description,
    }
  })
}

function mapReactionItems(
  reactions: readonly MonsterReaction[],
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
): MonsterActionItemViewModel[] {
  return reactions.map((action) => {
    const [base] = mapActionItems([action], 'reactions', derived, catalogState)
    const trigger = 'trigger' in action && action.trigger ? `Trigger: ${action.trigger}` : undefined
    return {
      id: base?.id ?? action.id,
      name: base?.name ?? action.id,
      attackLine: base?.attackLine,
      descriptionHtml: base?.descriptionHtml,
      triggerLine: trigger,
    }
  })
}

function formatSenseLines(monster: Monster, passivePerception?: number): string {
  const senseParts = monster.senses.map((sense) =>
    sense.range != null ? `${sense.type} ${sense.range} ft.` : sense.type,
  )
  if (passivePerception != null) {
    senseParts.push(`passive Perception ${passivePerception}`)
  }
  return senseParts.join(', ')
}

function formatLanguageLines(monster: Monster): string | undefined {
  const { entries, telepathy, note } = monster.languages
  if (entries.length === 0 && telepathy == null && !note) {
    return undefined
  }

  const speaking = entries.filter((entry) => entry.speaks !== false)
  const understandsOnly = entries.filter((entry) => entry.speaks === false)

  const parts: string[] = []
  if (speaking.length > 0) {
    parts.push(speaking.map((entry) => getLanguageLabel(entry.language)).join(', '))
  }
  if (understandsOnly.length > 0) {
    const labels = understandsOnly.map((entry) => getLanguageLabel(entry.language)).join(', ')
    parts.push(`understands ${labels} but can't speak`)
  }
  if (telepathy != null) {
    parts.push(`telepathy ${telepathy} ft.`)
  }
  if (note) {
    parts.push(note)
  }

  return parts.join('; ')
}

function formatDefenseLine(
  label: string,
  values: readonly string[],
  formatLabel: (id: string) => string,
): string | undefined {
  if (values.length === 0) return undefined
  return `${label} ${values.map(formatLabel).join(', ')}`
}

function formatDefenses(monster: Monster): string | undefined {
  const { defenses } = monster
  const parts = [
    formatDefenseLine('Damage vulnerabilities', defenses.vulnerabilities, getDamageTypeLabel),
    formatDefenseLine('Damage resistances', defenses.resistances, getDamageTypeLabel),
    formatDefenseLine('Damage immunities', defenses.immunities, getDamageTypeLabel),
    formatDefenseLine(
      'Condition immunities',
      defenses.conditionImmunities,
      getEffectConditionLabel,
    ),
  ].filter(Boolean)
  return parts.length > 0 ? parts.join('; ') : undefined
}

function buildGearLines(
  monster: Monster,
  equipmentById: Map<string, Equipment>,
  catalogState: MonsterCatalogLoadState,
): MonsterGearLineViewModel[] {
  return monster.equipment.map((entry) => {
    const catalogItem = equipmentById.get(entry.equipmentId)
    const catalogName = catalogItem?.name
    const primary = entry.customName ?? catalogName ?? MONSTER_UNRESOLVED_CATALOG_REFERENCE
    const secondary =
      entry.customName && catalogName && entry.customName !== catalogName ? catalogName : undefined

    if (catalogState === 'error' && !catalogItem && !entry.customName) {
      return { entryId: entry.entryId, primary: MONSTER_UNRESOLVED_CATALOG_REFERENCE }
    }

    return { entryId: entry.entryId, primary, secondary }
  })
}

function buildSkillsDetailsLeaf(
  monster: Monster,
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
): MonsterDetailsLeafViewModel | undefined {
  if (catalogState === 'ready' && derived && derived.skills.length > 0) {
    const body = derived.skills
      .map((skill) => `${skill.label} ${formatSignedModifier(skill.modifier)}`)
      .join(', ')
    return { id: 'skills', label: 'Skills', body }
  }
  if (catalogState === 'error' && monster.proficiencies.skills.length > 0) {
    return { id: 'skills', label: 'Skills', body: MONSTER_UNRESOLVED_CATALOG_REFERENCE }
  }
  return undefined
}

function buildSensesDetailsLeaf(
  monster: Monster,
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
): MonsterDetailsLeafViewModel | undefined {
  if (monster.senses.length === 0 && !(catalogState === 'ready' && derived)) {
    return undefined
  }
  const body =
    catalogState === 'ready' && derived
      ? formatSenseLines(monster, derived.passivePerception)
      : formatSenseLines(monster)
  return body ? { id: 'senses', label: 'Senses', body } : undefined
}

function buildGearDetailsLeaf(
  monster: Monster,
  equipmentById: Map<string, Equipment>,
  catalogState: MonsterCatalogLoadState,
): MonsterDetailsLeafViewModel | undefined {
  const gear = buildGearLines(monster, equipmentById, catalogState)
  if (gear.length === 0) return undefined
  const body = gear
    .map((line) => (line.secondary ? `${line.primary} (${line.secondary})` : line.primary))
    .join(', ')
  return { id: 'gear', label: 'Gear', body }
}

function buildDetailsLeaves(
  monster: Monster,
  derived: DerivedMonsterStatBlock | null | undefined,
  equipmentById: Map<string, Equipment>,
  catalogState: MonsterCatalogLoadState,
): MonsterDetailsLeafViewModel[] {
  const languages = formatLanguageLines(monster)
  const defenses = formatDefenses(monster)

  return [
    buildSkillsDetailsLeaf(monster, derived, catalogState),
    buildSensesDetailsLeaf(monster, derived, catalogState),
    languages ? { id: 'languages', label: 'Languages', body: languages } : undefined,
    defenses ? { id: 'defenses', label: 'Defenses', body: defenses } : undefined,
    buildGearDetailsLeaf(monster, equipmentById, catalogState),
  ].filter((leaf): leaf is MonsterDetailsLeafViewModel => leaf != null)
}

export function buildMonsterDetailViewModel({
  monster,
  creatureTypeLabel,
  equipmentById,
  catalogState,
  derived,
}: BuildMonsterDetailViewModelInput): MonsterDetailViewModel {
  const sizeLabel = getCreatureSizeLabel(monster.size)
  const classificationLabel =
    joinInlineMetadata([sizeLabel, creatureTypeLabel]) || creatureTypeLabel

  const statRows: ContentStatRowData[] = []
  if (catalogState === 'ready' && derived) {
    statRows.push(
      formatAcStatRow(monster, derived, equipmentById),
      formatHpStatRow(derived),
      formatSpeedStatRow(monster),
      {
        id: 'initiative',
        label: 'Initiative',
        value: derived.initiativeLabel,
      },
      formatCrStatRow(monster, derived),
    )
  }

  const abilities = catalogState === 'ready' && derived ? buildAbilityRows(monster, derived) : []

  return {
    classificationLabel,
    catalogState,
    statRows,
    abilities,
    detailsLeaves: buildDetailsLeaves(monster, derived, equipmentById, catalogState),
    traits: monster.traits.map((trait) => ({
      id: trait.id,
      name: trait.name,
      descriptionHtml: trait.description,
    })),
    actions: mapActionItems(monster.actions, 'actions', derived, catalogState),
    bonusActions: mapActionItems(monster.bonusActions, 'bonusActions', derived, catalogState),
    reactions: mapReactionItems(monster.reactions, derived, catalogState),
  }
}

export function buildMonsterEquipmentCatalog(equipment: Equipment[]): Map<string, Equipment> {
  return new Map(equipment.map((item) => [item.id, item]))
}

/** Derives stat block when catalogs are ready; returns null while pending or on failure. */
export function tryDeriveMonsterStatBlock(
  monster: Monster,
  equipment: Equipment[],
  skillProficiencies: SkillProficiency[],
): DerivedMonsterStatBlock | null {
  try {
    const equipmentCatalog = buildMonsterEquipmentCatalog(equipment)
    const skillCatalog = new Map(skillProficiencies.map((skill) => [skill.slug, skill]))
    return deriveMonsterStatBlock({
      monster,
      equipmentCatalog,
      skillCatalog,
    })
  } catch {
    return null
  }
}

export function formatMonsterAbilityHeader(ability: (typeof ABILITY_IDS)[number]): string {
  return getAbilityCompactLabel(ability)
}
