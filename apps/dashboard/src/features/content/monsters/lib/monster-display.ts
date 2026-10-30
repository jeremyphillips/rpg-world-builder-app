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
  formatCreatureCommunication,
  formatMonsterChallengeMetadata,
  formatPassivePerceptionStatPhrase,
  type Equipment,
  type Monster,
  type MonsterAction,
  type MonsterReaction,
  type SkillProficiency,
  deriveMonsterStatBlock,
  formatMonsterLimitedUseHeading,
  formatMonsterSpellEntry,
  limitedUseSchema,
  type ArmorClassRules,
  type DerivedMonsterAttackLine,
  type MonsterReferencedSpell,
  type DerivedFieldReason,
  type DerivedMonsterStatBlock,
  type MagicPropertyDefinitionProvider,
} from '@rpg/contracts'

import {
  monsterArmorClassCaption,
  monsterArmorClassCompactLabel,
  monsterArmorClassUnavailableCopy,
} from './statistics/monster-armor-class-presentation'

import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'

import { MONSTER_HP_MINIMUM_NOTE } from './monster-form-labels'

export { MONSTER_HP_MINIMUM_NOTE }

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
  /** `Trigger: …` when the reaction has authored eligibility prose. */
  triggerLine?: string
  /** `Response:` when that authored trigger has a description or attack line. */
  responseLabel?: string
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
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  spellCatalogStatus?: 'ready' | 'unavailable'
}

export function monsterUnavailableReasonCopy(
  reason: DerivedFieldReason,
  subject: 'generic' | 'challenge' | 'armor',
): string {
  if (reason === 'conflict' || (reason === 'missing-reference' && subject === 'armor')) {
    return monsterArmorClassUnavailableCopy(
      reason === 'conflict' ? 'conflict' : 'missing-reference',
    )
  }
  if (reason === 'missing-input' && subject === 'challenge')
    return 'Set a challenge rating to calculate'
  return 'Not set'
}

function formatAcStatRow(derived: DerivedMonsterStatBlock): ContentStatRowData {
  if (derived.ac.status === 'unavailable') {
    return {
      id: 'ac',
      label: monsterArmorClassCompactLabel(),
      value: monsterUnavailableReasonCopy(derived.ac.reason, 'armor'),
    }
  }

  return {
    id: 'ac',
    label: monsterArmorClassCompactLabel(),
    value: joinInlineMetadata([
      String(derived.ac.value.ac),
      monsterArmorClassCaption(derived.ac.value),
    ]),
  }
}

function formatHpStatRow(derived: DerivedMonsterStatBlock): ContentStatRowData {
  const formula = derived.hpClampedToMinimum
    ? `${derived.hpFormula} ${MONSTER_HP_MINIMUM_NOTE}`
    : derived.hpFormula
  return {
    id: 'hp',
    label: 'HP',
    value: joinInlineMetadata([String(derived.hp), formula]) || String(derived.hp),
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
  const rewardMetadata = formatMonsterChallengeMetadata({
    experiencePoints: derived.experiencePoints,
    proficiencyBonus: derived.proficiencyBonus,
  })
  return {
    id: 'cr',
    label: 'CR',
    value: joinInlineMetadata([crLabel, rewardMetadata]) || crLabel,
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
  const primary = line.damageExpression ? `${line.damage} (${line.damageExpression})` : line.damage
  const extra = (line.additionalDamage ?? [])
    .map((part) => `${part.average} (${part.expression}) ${part.damageTypeLabel}`)
    .join(' plus ')
  const damagePart = extra
    ? `Hit: ${primary} ${line.damageTypeLabel} damage plus ${extra} damage`
    : `Hit: ${primary} ${line.damageTypeLabel} damage`
  return joinInlineMetadata([hitPart, damagePart]) || line.name
}

function findAttackLine(
  derived: DerivedMonsterStatBlock | null | undefined,
  section: DerivedMonsterAttackLine['section'],
  actionId: string,
): DerivedMonsterAttackLine | undefined {
  return derived?.attacks.find((line) => line.section === section && line.id === actionId)
}

function withLimitedUseHeading(name: string, limitedUse: unknown): string {
  const parsed = limitedUseSchema.safeParse(limitedUse)
  return parsed.success ? formatMonsterLimitedUseHeading(name, parsed.data) : name
}

function resolveActionName(
  action: MonsterAction,
  attack: DerivedMonsterAttackLine | undefined,
): string {
  const name =
    action.kind === 'special' || action.kind === 'natural-weapon'
      ? action.name
      : (action.name ?? attack?.name ?? action.id)
  return withLimitedUseHeading(name, action.limitedUse)
}

function resolveActionAttackLine(
  catalogState: MonsterCatalogLoadState,
  attack: DerivedMonsterAttackLine | undefined,
): string | undefined {
  if (catalogState === 'ready' && attack) {
    return formatAttackLine(attack)
  }
  if (catalogState === 'error' || (catalogState === 'ready' && !attack)) {
    return MONSTER_UNRESOLVED_CATALOG_REFERENCE
  }
  return undefined
}

type SpellDisplayContext = {
  monsterName: string
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  catalogStatus: 'ready' | 'unavailable'
  spellsInBody: Map<string, Extract<MonsterAction | MonsterReaction, { kind: 'spell' }>>
}

function mapActionItem(
  action: MonsterAction | MonsterReaction,
  section: DerivedMonsterAttackLine['section'],
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
): MonsterActionItemViewModel {
  if (action.kind === 'spell') {
    const rendered = formatMonsterSpellEntry({
      entry: action,
      monsterName: spells.monsterName,
      section,
      spellsById: spells.spellsById,
      catalogStatus: spells.catalogStatus,
      spellsInBody: spells.spellsInBody,
    })
    const descriptionHtml = [rendered.bodyHtml, action.description].filter(Boolean).join('')
    return {
      id: action.id,
      name: rendered.heading,
      descriptionHtml: descriptionHtml || undefined,
    }
  }

  const attack = findAttackLine(derived, section, action.id)
  const name = resolveActionName(action, attack)

  if (action.kind === 'special') {
    return {
      id: action.id,
      name,
      descriptionHtml: action.description,
    }
  }

  return {
    id: action.id,
    name,
    attackLine: resolveActionAttackLine(catalogState, attack),
    descriptionHtml: action.description,
  }
}

function mapActionItems(
  actions: readonly (MonsterAction | MonsterReaction)[],
  section: DerivedMonsterAttackLine['section'],
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
): MonsterActionItemViewModel[] {
  return actions.map((action) => mapActionItem(action, section, derived, catalogState, spells))
}

function mapReactionItems(
  reactions: readonly MonsterReaction[],
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
): MonsterActionItemViewModel[] {
  return reactions.map((action) =>
    reactionItemView(
      action,
      mapActionItems([action], 'reactions', derived, catalogState, spells)[0],
    ),
  )
}

function reactionItemView(
  action: MonsterReaction,
  base: MonsterActionItemViewModel | undefined,
): MonsterActionItemViewModel {
  const triggerText = action.trigger?.text
  const hasBody = Boolean(base?.attackLine || base?.descriptionHtml)
  return {
    id: base?.id ?? action.id,
    name: base?.name ?? action.id,
    attackLine: base?.attackLine,
    descriptionHtml: base?.descriptionHtml,
    triggerLine: triggerLine(triggerText),
    responseLabel: responseLabel(triggerText, hasBody),
  }
}

function triggerLine(text: string | undefined): string | undefined {
  if (!text) return undefined
  return `Trigger: ${text}`
}

function responseLabel(text: string | undefined, hasBody: boolean): string | undefined {
  if (!text || !hasBody) return undefined
  return 'Response:'
}

function formatSenseLines(monster: Monster, passivePerception?: number): string {
  const senseParts = monster.senses.map((sense) =>
    sense.range != null ? `${sense.type} ${sense.range} ft.` : sense.type,
  )
  if (passivePerception != null) {
    senseParts.push(formatPassivePerceptionStatPhrase(passivePerception))
  }
  return senseParts.join(', ')
}

function formatLanguageLines(monster: Monster): string | undefined {
  return formatCreatureCommunication(
    {
      languages: monster.proficiencies.languages,
      telepathy: monster.communication.telepathy,
      additionalLanguageCount: monster.proficiencies.additionalLanguageCount,
    },
    { formatLanguageLabel: getLanguageLabel },
  )
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
  spellsById,
  spellCatalogStatus = 'unavailable',
}: BuildMonsterDetailViewModelInput): MonsterDetailViewModel {
  const spellContext = {
    monsterName: monster.name,
    spellsById,
    catalogStatus: spellCatalogStatus,
    spellsInBody: new Map(
      [...monster.actions, ...monster.bonusActions, ...monster.reactions]
        .filter((action) => action.kind === 'spell')
        .map((action) => [action.id, action]),
    ),
  }
  const sizeLabel = [monster.size, ...monster.alternateSizes]
    .map((size) => getCreatureSizeLabel(size))
    .join(' or ')
  const classificationLabel =
    joinInlineMetadata([sizeLabel, creatureTypeLabel]) || creatureTypeLabel

  const statRows: ContentStatRowData[] = []
  if (catalogState === 'ready' && derived) {
    statRows.push(
      formatAcStatRow(derived),
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
    actions: mapActionItems(monster.actions, 'actions', derived, catalogState, spellContext),
    bonusActions: mapActionItems(
      monster.bonusActions,
      'bonusActions',
      derived,
      catalogState,
      spellContext,
    ),
    reactions: mapReactionItems(monster.reactions, derived, catalogState, spellContext),
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
  options?: {
    armorClassRules?: ArmorClassRules
    magicPropertyProvider?: MagicPropertyDefinitionProvider
  },
): DerivedMonsterStatBlock | null {
  if (!options?.armorClassRules) return null
  try {
    const equipmentCatalog = buildMonsterEquipmentCatalog(equipment)
    const skillCatalog = new Map(skillProficiencies.map((skill) => [skill.slug, skill]))
    return deriveMonsterStatBlock({
      monster,
      equipmentCatalog,
      skillCatalog,
      armorClassRules: options?.armorClassRules,
      magicPropertyProvider: options?.magicPropertyProvider ?? (() => undefined),
    })
  } catch (error) {
    console.error('deriveMonsterStatBlock failed', { monsterId: monster.id, error })
    return null
  }
}

export function formatMonsterAbilityHeader(ability: (typeof ABILITY_IDS)[number]): string {
  return getAbilityCompactLabel(ability)
}
