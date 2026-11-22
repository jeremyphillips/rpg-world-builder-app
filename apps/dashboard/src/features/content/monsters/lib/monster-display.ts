import { formatMonsterClassification } from '@rpg/contracts'
import {
  ABILITY_IDS,
  abilityModifier,
  formatSignedModifier,
  getAbilityCompactLabel,
  formatCreatureSizeList,
  getDamageTypeLabel,
  getEffectConditionLabel,
  getLanguageLabel,
  getSenseLabel,
  joinInlineMetadata,
  formatMovementDisplay,
  formatCreatureCommunication,
  formatCrStatRow as formatMonsterCrStatRow,
  resolveMonsterInLairExperiencePoints,
  formatPassivePerceptionStatPhrase,
  formatStatBlockRollExpression,
  type Equipment,
  type Monster,
  type MonsterAction,
  type MonsterBonusAction,
  type MonsterLegendaryAction,
  type MonsterReaction,
  type SkillProficiency,
  availableBodyRows,
  deriveMonsterStatBlock,
  analyzeCreatureFormDifferences,
  formatFormSpeechQualifier,
  formatMonsterForms,
  formatMonsterParryTrigger,
  formatMonsterSpeedStatRow,
  monsterHasFormRestrictions,
  resolveFormDifferencesPresentation,
  shapeShiftRows,
  monsterActionSectionRows,
  formatLegendaryActionUsesIntro,
  resolveCreatureSenses,
  resolveCreatureTraitGrants,
  monsterRichTextIsEmpty,
  type ArmorClassRules,
  type DerivedMonsterAttackLine,
  type MonsterReferencedSpell,
  type DerivedFieldReason,
  type DerivedMonsterStatBlock,
  type MagicPropertyDefinitionProvider,
  statBlockReactionLead,
  type StatBlockProse,
  type StatBlockProseDocument,
  type StatBlockProseSegment,
} from '@rpg/contracts'

import {
  monsterArmorClassCaption,
  monsterArmorClassCompactLabel,
  monsterArmorClassUnavailableCopy,
} from './statistics/monster-armor-class-presentation'

import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'

import { applyMonsterEntryHeadingQualifiers } from './presentation/monster-entry-heading'
import {
  buildSpellDisplayContext,
  MONSTER_UNRESOLVED_CATALOG_REFERENCE,
  proseSavingThrowParagraph,
  resolveActionStatBlockRulesFacing,
  resolveActionStatBlockRulesFacingList,
  actionReferenceHeadings,
  type MonsterCatalogLoadState,
} from './presentation/resolve-action-stat-block-rules-facing'
import {
  resolvePresetTraitStatBlockRulesFacing,
  resolveTemplateTraitStatBlockRulesFacing,
} from './presentation/resolve-trait-stat-block-rules-facing'
import { MONSTER_HP_MINIMUM_NOTE } from './monster-form-labels'

export { MONSTER_HP_MINIMUM_NOTE, MONSTER_UNRESOLVED_CATALOG_REFERENCE }

export type { MonsterCatalogLoadState }

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
  derivedAttackLine?: DerivedMonsterAttackLine
  rulesProse?: StatBlockProseDocument
  /** Emphasized `Trigger:` lead when the reaction has authored eligibility prose. */
  triggerProse?: StatBlockProse
  /** Emphasized `Response:` lead before structured attack or supplemental rules copy. */
  responseLeadProse?: StatBlockProse
  /** Plain attack line folded into `Response:` when there is no derived attack sentence. */
  responseAttackProse?: StatBlockProse
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
  legendaryActions: MonsterActionItemViewModel[]
  legendaryActionsIntro?: string
}

export type BuildMonsterDetailViewModelInput = {
  monster: Monster
  creatureTypeLabel: string
  familyLabel?: (id: string) => string
  classLabel?: (id: string) => string
  equipmentById: Map<string, Equipment>
  catalogState: MonsterCatalogLoadState
  derived?: DerivedMonsterStatBlock | null
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  spellCatalogStatus?: 'ready' | 'unavailable'
  magicPropertyProvider?: MagicPropertyDefinitionProvider
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

/** The resolver stores `9d8 +18`. The stat-block roll helper expects `9d8+18`. */
function presentHitDiceFormula(formula: string): string {
  return formatStatBlockRollExpression(formula.replace(/ ([+-])(?=\d+$)/, '$1'))
}

function formatHpStatRow(derived: DerivedMonsterStatBlock): ContentStatRowData {
  const formula = presentHitDiceFormula(derived.hpFormula)
  const minimum = derived.hpClampedToMinimum
    ? `, ${MONSTER_HP_MINIMUM_NOTE.replace(/^\((.*)\)$/, '$1')}`
    : ''
  return {
    id: 'hp',
    label: 'HP',
    value: `${derived.hp} (${formula}${minimum})`,
  }
}

function formatSpeedStatRow(monster: Monster): ContentStatRowData {
  const hasShapeShift = shapeShiftRows(monster).length > 0
  const value =
    (monster.forms
      ? formatMonsterSpeedStatRow({
          sizes: monster.sizes,
          movement: monster.movement,
          hover: monster.hover,
          forms: monster.forms,
          monsterName: monster.name,
          hasShapeShift,
        })
      : undefined) ??
    (() => {
      const movement = formatMovementDisplay(monster.movement, 'ft.')
      return movement && monster.hover ? `${movement} (hover)` : movement
    })()
  return {
    id: 'speed',
    label: 'Speed',
    value,
  }
}

function formatCrStatRow(monster: Monster, derived: DerivedMonsterStatBlock): ContentStatRowData {
  const inLairXp =
    monster.lair?.enabled === true && monster.lair.experience
      ? resolveMonsterInLairExperiencePoints({
          challengeRating: monster.challengeRating,
          lair: monster.lair,
        })
      : undefined
  return {
    id: 'cr',
    label: 'CR',
    value: formatMonsterCrStatRow({
      challengeRating: monster.challengeRating,
      experiencePoints: derived.experiencePoints,
      proficiencyBonus: derived.proficiencyBonus,
      inLairExperiencePoints: inLairXp,
    }),
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

function withQualifiedHeading(monster: Monster, name: string, row: unknown): string {
  return applyMonsterEntryHeadingQualifiers(monster, name, row)
}

function mapActionItems(
  actions: readonly (
    | MonsterAction
    | MonsterBonusAction
    | MonsterReaction
    | MonsterLegendaryAction
  )[],
  section: DerivedMonsterAttackLine['section'],
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: Parameters<typeof resolveActionStatBlockRulesFacingList>[4],
): MonsterActionItemViewModel[] {
  return resolveActionStatBlockRulesFacingList(actions, section, derived, catalogState, spells).map(
    (facing) => ({
      id: facing.id,
      name: facing.name,
      attackLine: facing.attackLine,
      descriptionHtml: facing.descriptionHtml,
      derivedAttackLine: derived?.attacks.find(
        (line) => line.id === facing.id && line.section === section,
      ),
      rulesProse: facing.rulesProse,
    }),
  )
}

function formsTrait(monster: Monster): MonsterTraitItemViewModel[] {
  if (!monster.forms || monster.forms.definedForms.length === 0) return []
  if (shapeShiftRows(monster).length > 0) return []
  const text = formatMonsterForms({
    monsterName: monster.name,
    baseSizes: monster.sizes,
    baseMovement: monster.movement,
    baseHover: monster.hover,
    forms: monster.forms,
    hasFormRestrictions: monsterHasFormRestrictions(monster),
  })
  if (!text) return []
  return [
    {
      id: 'forms',
      name: 'Forms',
      descriptionHtml: `<p>${escapeStatBlockText(text)}</p>`,
    },
  ]
}

function escapeStatBlockText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function mapReactionItems(
  reactions: readonly MonsterReaction[],
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: Parameters<typeof resolveActionStatBlockRulesFacingList>[4],
): MonsterActionItemViewModel[] {
  const headings = actionReferenceHeadings(reactions, spells)
  return reactions.map((action) => {
    const triggerText =
      action.kind === 'parry' ? formatMonsterParryTrigger(spells.monsterName) : action.trigger?.text
    const facing = resolveActionStatBlockRulesFacing(
      action,
      'reactions',
      derived,
      catalogState,
      spells,
      headings,
    )
    return reactionItemView(
      {
        id: facing.id,
        name: facing.name,
        attackLine: facing.attackLine,
        descriptionHtml: facing.descriptionHtml,
        derivedAttackLine: derived?.attacks.find(
          (line) => line.id === facing.id && line.section === 'reactions',
        ),
        rulesProse: facing.rulesProse,
      },
      triggerText,
    )
  })
}

const responseLeadOnly: StatBlockProse = [
  { kind: 'lead', treatment: 'inline', label: 'Response' } satisfies StatBlockProseSegment,
]

// fallow-ignore-next-line complexity
function reactionItemView(
  base: MonsterActionItemViewModel,
  triggerText: string | undefined,
): MonsterActionItemViewModel {
  const hasBody = Boolean(
    base.attackLine ||
    base.derivedAttackLine ||
    base.descriptionHtml ||
    (base.rulesProse && base.rulesProse.length > 0),
  )
  const showResponse = Boolean(triggerText && hasBody)
  const responseAttackProse =
    showResponse && base.attackLine && !base.derivedAttackLine
      ? statBlockReactionLead('Response', base.attackLine)
      : undefined
  return {
    ...base,
    attackLine: responseAttackProse ? undefined : base.attackLine,
    triggerProse: triggerText ? statBlockReactionLead('Trigger', triggerText) : undefined,
    responseLeadProse: showResponse && !responseAttackProse ? responseLeadOnly : undefined,
    responseAttackProse,
  }
}

function formatSenseLines(monster: Monster, passivePerception?: number): string {
  const senses = resolveCreatureSenses({
    authored: monster.senses,
    grants: resolveCreatureTraitGrants(
      monster.traits.flatMap((trait) => ('kind' in trait ? [{ trait, source: trait.id }] : [])),
    ).map((resolved) => resolved.grant),
  })
  const senseParts = senses.map((sense) => {
    const label = getSenseLabel(sense.type)
    return sense.range != null ? `${label} ${sense.range} ft.` : label
  })
  if (passivePerception != null) {
    senseParts.push(formatPassivePerceptionStatPhrase(passivePerception))
  }
  return senseParts.join(', ')
}

function formatLanguageLines(monster: Monster): string | undefined {
  const hasShapeShift = shapeShiftRows(monster).length > 0
  const speechQualifier = (() => {
    if (!monster.forms) return undefined
    const presentation = resolveFormDifferencesPresentation(monster.forms, hasShapeShift)
    if (presentation !== 'stat-rows') return undefined
    const analysis = analyzeCreatureFormDifferences({
      sizes: monster.sizes,
      movement: monster.movement,
      hover: monster.hover,
      forms: monster.forms,
      monsterName: monster.name,
    })
    return analysis?.speechDiffers ? formatFormSpeechQualifier(analysis.silentFormNames) : undefined
  })()
  return formatCreatureCommunication(
    {
      languages: monster.proficiencies.languages,
      telepathy: monster.communication.telepathy,
      additionalLanguageCount: monster.proficiencies.additionalLanguageCount,
      speechQualifier,
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

function escapeTraitSentence(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function joinRulesAndSavingThrow(
  rules: string | undefined,
  paragraph: string | undefined,
): string | undefined {
  const rulesHtml = rules && !monsterRichTextIsEmpty(rules) ? rules : ''
  const saveHtml = paragraph ? `<p>${escapeTraitSentence(paragraph)}</p>` : ''
  const body = `${rulesHtml}${saveHtml}`
  return body || undefined
}

function traitRecord(trait: Monster['traits'][number]): Record<string, unknown> {
  return trait as Record<string, unknown>
}

function mapPresetMonsterTrait(
  trait: Monster['traits'][number],
  record: Record<string, unknown>,
  monsterName: string,
): MonsterTraitItemViewModel | undefined {
  if (typeof record.preset !== 'string') return undefined
  const facing = resolvePresetTraitStatBlockRulesFacing({
    id: trait.id,
    preset: record.preset,
    monsterName,
    trait: trait as Monster['traits'][number],
  })
  return {
    id: trait.id,
    name: facing.heading,
    descriptionHtml: facing.descriptionHtml,
  }
}

function mapTemplateMonsterTrait(
  trait: Monster['traits'][number],
  record: Record<string, unknown>,
  monster: Monster,
): MonsterTraitItemViewModel | undefined {
  if (record.kind !== 'template' || typeof record.templateId !== 'string') return undefined
  const nameOverride = typeof record.nameOverride === 'string' ? record.nameOverride : undefined
  const descriptionOverride =
    typeof record.descriptionOverride === 'string' ? record.descriptionOverride : undefined
  const facing = resolveTemplateTraitStatBlockRulesFacing({
    id: trait.id,
    templateId: record.templateId,
    config: record.config,
    nameOverride,
    descriptionOverride,
    monster,
  })
  return {
    id: trait.id,
    name: facing.heading,
    descriptionHtml: facing.descriptionHtml,
  }
}

function mapNamedMonsterTrait(
  trait: Monster['traits'][number],
  record: Record<string, unknown>,
  monster: Monster,
  derived: DerivedMonsterStatBlock | null | undefined,
): MonsterTraitItemViewModel {
  const name = typeof record.name === 'string' ? record.name : trait.id
  const description = typeof record.description === 'string' ? record.description : ''
  const paragraph = proseSavingThrowParagraph(
    monster,
    'savingThrow' in trait ? trait.savingThrow : undefined,
    derived,
  )
  return {
    id: trait.id,
    name,
    descriptionHtml: joinRulesAndSavingThrow(description, paragraph) ?? '',
  }
}

function mapMonsterTrait(
  trait: Monster['traits'][number],
  monster: Monster,
  derived: DerivedMonsterStatBlock | null | undefined,
): MonsterTraitItemViewModel {
  const record = traitRecord(trait)
  const mapped =
    mapPresetMonsterTrait(trait, record, monster.name) ??
    mapTemplateMonsterTrait(trait, record, monster) ??
    mapNamedMonsterTrait(trait, record, monster, derived)
  const ids = 'onlyInFormIds' in trait ? trait.onlyInFormIds : undefined
  return {
    ...mapped,
    name: withQualifiedHeading(monster, mapped.name, { onlyInFormIds: ids }),
  }
}

function formatLegendaryActionsIntro(monster: Monster): string | undefined {
  const block = monster.legendaryActions
  if (
    availableBodyRows(monsterActionSectionRows<MonsterLegendaryAction>(monster, 'legendaryActions'))
      .length === 0 ||
    block?.uses?.normal === undefined
  ) {
    return undefined
  }
  return formatLegendaryActionUsesIntro({
    monsterName: monster.name,
    uses: block.uses,
    lairEnabled: monster.lair?.enabled === true,
  })
}

// fallow-ignore-next-line complexity
export function buildMonsterDetailViewModel({
  monster,
  creatureTypeLabel,
  familyLabel,
  classLabel,
  equipmentById,
  catalogState,
  derived,
  spellsById,
  spellCatalogStatus = 'unavailable',
  magicPropertyProvider = () => undefined,
}: BuildMonsterDetailViewModelInput): MonsterDetailViewModel {
  const spellContext = buildSpellDisplayContext({
    monster,
    equipmentById,
    catalogState,
    spellsById,
    spellCatalogStatus,
    magicPropertyProvider,
  })
  const sizeLabel = formatCreatureSizeList(monster.sizes)
  const classificationLabel =
    joinInlineMetadata([
      sizeLabel,
      formatMonsterClassification(monster, { creatureTypeLabel, familyLabel, classLabel }),
    ]) || creatureTypeLabel

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
    traits: [
      ...monster.traits
        .filter((trait) => {
          const available = (trait as { available?: boolean }).available
          return available !== false
        })
        .map((trait) => mapMonsterTrait(trait, monster, derived)),
      ...formsTrait(monster),
    ],
    actions: mapActionItems(
      availableBodyRows(monster.actions),
      'actions',
      derived,
      catalogState,
      spellContext,
    ),
    bonusActions: mapActionItems(
      availableBodyRows(monster.bonusActions),
      'bonusActions',
      derived,
      catalogState,
      spellContext,
    ),
    reactions: mapReactionItems(
      availableBodyRows(monster.reactions),
      derived,
      catalogState,
      spellContext,
    ),
    legendaryActions: mapActionItems(
      availableBodyRows(
        monsterActionSectionRows<MonsterLegendaryAction>(monster, 'legendaryActions'),
      ),
      'legendaryActions',
      derived,
      catalogState,
      spellContext,
    ),
    legendaryActionsIntro: formatLegendaryActionsIntro(monster),
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
