import {
  ABILITY_IDS,
  abilityModifier,
  CHALLENGE_RATING_MECHANICS,
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
  formatExperiencePoints,
  formatProficiencyBonus,
  formatPassivePerceptionStatPhrase,
  formatStatBlockRollExpression,
  type Equipment,
  type CastingAbility,
  type Monster,
  type SavingThrowEffect,
  type MonsterAction,
  type MonsterBonusAction,
  type MonsterLegendaryAction,
  type MonsterReaction,
  type SkillProficiency,
  availableBodyRows,
  deriveMonsterStatBlock,
  isMonsterActionAttackKind,
  formatCreatureTrait,
  formatMonsterAttackAction,
  formatMonsterActionReference,
  formatMonsterLeap,
  formatMonsterParryResponse,
  formatMonsterParryTrigger,
  formatMonsterTakeActions,
  formatMonsterTeleport,
  formatLegendaryActionUsesIntro,
  formatOnceUntilNextTurnSentence,
  resolveCreatureSenses,
  resolveCreatureTraitGrants,
  resolveTraitDisplay,
  formatMonsterLimitedUseHeading,
  formatMonsterSaveAction,
  formatMonsterSpellEntry,
  formatMonsterStatBlockSubject,
  type MonsterActionIdentitySubject,
  formatSavingThrowClauses,
  getAbilityLabel,
  monsterRichTextIsEmpty,
  resolveProseSavingThrowDc,
  appendMonsterActionSupplementalHtml,
  appendMonsterActionSupplementalText,
  resolveMonsterActionIdentity,
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

import { buildMonsterMultiattackSentence } from './actions/monster-action-multiattack-summary'
import {
  nextDistinctTitle,
  presentActionReference,
} from './actions/monster-action-reference-presentation'
import { formatMonsterTemplateSentence } from './format-monster-template-sentence'
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
  legendaryActions: MonsterActionItemViewModel[]
  legendaryActionsIntro?: string
}

export type BuildMonsterDetailViewModelInput = {
  monster: Monster
  creatureTypeLabel: string
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
  const movement = formatMovementDisplay(monster.movement, 'ft.')
  const value = movement && monster.hover ? `${movement} (hover)` : movement
  return {
    id: 'speed',
    label: 'Speed',
    value,
  }
}

function formatCrStatRow(monster: Monster, derived: DerivedMonsterStatBlock): ContentStatRowData {
  const reward = `${formatExperiencePoints(derived.experiencePoints)}; ${formatProficiencyBonus(derived.proficiencyBonus)}`
  return {
    id: 'cr',
    label: 'CR',
    value: `${monster.challengeRating} (${reward})`,
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

function actionDisplayIdentity(
  action: MonsterActionIdentitySubject,
  monster: Monster,
  equipmentById: Map<string, Equipment>,
  catalogState: MonsterCatalogLoadState,
  magicPropertyProvider: MagicPropertyDefinitionProvider,
) {
  return resolveMonsterActionIdentity({
    action,
    equipment: monster.equipment,
    equipmentCatalog: equipmentById,
    magicPropertyProvider,
    equipmentCatalogStatus: catalogState,
  })
}

function proficiencyBonusForDisplay(
  monster: Monster,
  derived: DerivedMonsterStatBlock | null | undefined,
): number {
  if (derived) return derived.proficiencyBonus
  return CHALLENGE_RATING_MECHANICS[monster.challengeRating].proficiencyBonus
}

function spellcastingAbilityScore(
  monster: Monster,
  source: CastingAbility | undefined,
): number | undefined {
  if (!source) return undefined
  if (source.kind === 'ability') {
    return monster.abilityScores[source.ability]
  }
  const sections = [monster.actions, monster.bonusActions, monster.reactions] as const
  for (const section of sections) {
    for (const entry of section) {
      if (entry.kind !== 'spell' || entry.id !== source.entryId || !entry.castingAbility) continue
      if (entry.castingAbility.kind === 'ability') {
        return monster.abilityScores[entry.castingAbility.ability]
      }
    }
  }
  return undefined
}

function spellcastingAbilityScoreForSave(
  monster: Monster,
  dcSource: Extract<MonsterAction, { kind: 'save' }>['dcSource'],
): number | undefined {
  if (!dcSource || dcSource.kind !== 'spellcasting') return undefined
  return spellcastingAbilityScore(monster, dcSource.castingAbility)
}

function formatSaveActionBody(
  monster: Monster,
  action: Extract<MonsterAction | MonsterReaction, { kind: 'save' }>,
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  displayName: string,
): string | undefined {
  if (catalogState !== 'ready' || !action.resolution || !action.dcSource) {
    if (catalogState === 'error') return MONSTER_UNRESOLVED_CATALOG_REFERENCE
    return undefined
  }
  const formatted = formatMonsterSaveAction({
    action: { ...action, resolution: action.resolution, dcSource: action.dcSource },
    name: displayName,
    abilityScores: monster.abilityScores,
    proficiencyBonus: proficiencyBonusForDisplay(monster, derived),
    spellcastingAbilityScore: spellcastingAbilityScoreForSave(monster, action.dcSource),
  })
  return appendMonsterActionSupplementalText(formatted.body, action.description) || undefined
}

function formatMultiattackActionBody(
  monster: Monster,
  action: Extract<MonsterAction, { kind: 'multiattack' }>,
  equipmentById: Map<string, Equipment>,
  catalogState: MonsterCatalogLoadState,
  magicPropertyProvider: MagicPropertyDefinitionProvider,
): string | undefined {
  if (catalogState !== 'ready') {
    return catalogState === 'error' ? MONSTER_UNRESOLVED_CATALOG_REFERENCE : undefined
  }
  const generated = buildMonsterMultiattackSentence({
    monsterName: monster.name,
    action,
    actions: monster.actions,
    equipment: monster.equipment,
    equipmentCatalog: equipmentById,
    magicPropertyProvider,
  })
  return appendMonsterActionSupplementalText(generated, action.description) || undefined
}

function resolveActionAttackLine(
  catalogState: MonsterCatalogLoadState,
  attack: DerivedMonsterAttackLine | undefined,
): string | undefined {
  if (catalogState === 'ready' && attack) {
    return formatMonsterAttackAction(attack) ?? MONSTER_UNRESOLVED_CATALOG_REFERENCE
  }
  if (catalogState === 'error' || (catalogState === 'ready' && !attack)) {
    return MONSTER_UNRESOLVED_CATALOG_REFERENCE
  }
  return undefined
}

type SpellDisplayContext = {
  monster: Monster
  equipmentById: Map<string, Equipment>
  monsterName: string
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  catalogStatus: 'ready' | 'unavailable'
  catalogState: MonsterCatalogLoadState
  magicPropertyProvider: MagicPropertyDefinitionProvider
  spellsInBody: Map<string, Extract<MonsterAction | MonsterReaction, { kind: 'spell' }>>
}

function proseSavingThrowParagraph(
  monster: Monster,
  effect: SavingThrowEffect | undefined,
  derived: DerivedMonsterStatBlock | null | undefined,
): string | undefined {
  if (!effect?.ability || !effect.targets.trim() || !effect.failure.trim()) return undefined
  const dc = resolveProseSavingThrowDc({
    source: effect.dcSource,
    proficiencyBonus: proficiencyBonusForDisplay(monster, derived),
    spellcastingAbilityScore:
      effect.dcSource.kind === 'spellcasting'
        ? spellcastingAbilityScore(monster, effect.dcSource.castingAbility)
        : undefined,
  })
  return formatSavingThrowClauses({
    abilityLabel: getAbilityLabel(effect.ability),
    dc,
    targets: effect.targets,
    failure: effect.failure,
    success: effect.success,
  })
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

function withTurnLimit(
  body: string | undefined,
  action: { kind: string; onceUntilNextTurn?: boolean },
  monsterName: string,
  html: boolean,
  hasSavingThrow = false,
): string | undefined {
  if (action.onceUntilNextTurn !== true) return body
  const sentence = formatOnceUntilNextTurnSentence({
    monsterName,
    kind: action.kind,
    hasSavingThrow,
  })
  if (!body) return html ? `<p>${sentence}</p>` : sentence
  return html ? `${body}<p>${sentence}</p>` : `${body} ${sentence}`
}

function mapSpellActionItem(
  action: Extract<MonsterAction | MonsterReaction | MonsterLegendaryAction, { kind: 'spell' }>,
  section: DerivedMonsterAttackLine['section'],
  derived: DerivedMonsterStatBlock | null | undefined,
  spells: SpellDisplayContext,
  identityName: string,
): MonsterActionItemViewModel {
  const spellLine = derived?.spellcasting.find(
    (line) => line.id === action.id && line.section === section,
  )
  const rendered = formatMonsterSpellEntry({
    entry: { ...action, name: identityName },
    monsterName: spells.monsterName,
    section,
    spellsById: spells.spellsById,
    catalogStatus: spells.catalogStatus,
    spellsInBody: spells.spellsInBody,
    saveDc: spellLine?.saveDc,
  })
  const descriptionHtml = withTurnLimit(
    appendMonsterActionSupplementalHtml(rendered.bodyHtml, action.description),
    action,
    spells.monsterName,
    true,
  )
  return {
    id: action.id,
    name: rendered.heading,
    descriptionHtml: descriptionHtml || undefined,
  }
}

function mapSaveActionItem(
  action: Extract<MonsterAction | MonsterReaction, { kind: 'save' }>,
  name: string,
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
  identityName: string,
): MonsterActionItemViewModel {
  const body = formatSaveActionBody(spells.monster, action, derived, catalogState, identityName)
  return {
    id: action.id,
    name,
    descriptionHtml: body
      ? `<p>${withTurnLimit(body, action, spells.monsterName, false)}</p>`
      : withTurnLimit(action.description, action, spells.monsterName, true),
  }
}

function escapeStatBlockText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function parryFollowUpName(
  action: Extract<MonsterReaction, { kind: 'parry' }>,
  spells: SpellDisplayContext,
): string | undefined {
  if (!action.followUpActionId) return undefined
  const target = spells.monster.actions.find((row) => row.id === action.followUpActionId)
  if (!target || !isMonsterActionAttackKind(target.kind)) return undefined
  const name = actionDisplayIdentity(
    target,
    spells.monster,
    spells.equipmentById,
    spells.catalogState,
    spells.magicPropertyProvider,
  ).displayName.trim()
  return name.length > 0 ? name : undefined
}

function mapActionReferenceItem(
  action: Extract<MonsterLegendaryAction | MonsterReaction, { kind: 'action-reference' }>,
  name: string,
  spells: SpellDisplayContext,
): MonsterActionItemViewModel {
  const generated = formatMonsterActionReference({
    monsterName: spells.monsterName,
    action,
    actions: spells.monster.actions,
    equipment: spells.monster.equipment,
    equipmentCatalog: spells.equipmentById,
    magicPropertyProvider: spells.magicPropertyProvider,
  })
  const text = generated ? withTurnLimit(generated, action, spells.monsterName, false) : ''
  const rules = 'description' in action && action.description ? action.description : ''
  const descriptionHtml = text ? `<p>${escapeStatBlockText(text)}</p>${rules}` : undefined
  return {
    id: action.id,
    name,
    descriptionHtml,
  }
}

function mapMultiattackActionItem(
  action: Extract<MonsterAction, { kind: 'multiattack' }>,
  name: string,
  _derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
): MonsterActionItemViewModel {
  const body = formatMultiattackActionBody(
    spells.monster,
    action,
    spells.equipmentById,
    catalogState,
    spells.magicPropertyProvider,
  )
  return {
    id: action.id,
    name,
    descriptionHtml: body
      ? `<p>${withTurnLimit(body, action, spells.monsterName, false)}</p>`
      : action.description,
  }
}

function referenceSourceTitles(spells: SpellDisplayContext): Map<string, string> {
  const sourceTitles = new Map<string, string>()
  for (const action of spells.monster.actions) {
    const name = actionDisplayIdentity(
      action,
      spells.monster,
      spells.equipmentById,
      spells.catalogState,
      spells.magicPropertyProvider,
    ).displayName.trim()
    if (name && name !== action.id && name !== MONSTER_UNRESOLVED_CATALOG_REFERENCE) {
      sourceTitles.set(action.id, name)
    }
  }
  return sourceTitles
}

function assignReferenceHeadings(
  actions: readonly (
    | MonsterAction
    | MonsterBonusAction
    | MonsterReaction
    | MonsterLegendaryAction
  )[],
  sourceTitles: ReadonlyMap<string, string>,
  headings: Map<string, string>,
  taken: Set<string>,
  authored: boolean,
): void {
  for (const action of actions) {
    if (action.kind !== 'action-reference') continue
    const stored = action.name?.trim()
    if (authored) {
      if (!stored) continue
      headings.set(action.id, stored)
      taken.add(stored)
      continue
    }
    if (stored) continue
    const title = nextDistinctTitle(
      presentActionReference({ actionIds: action.actionIds, sourceTitles }).fallbackTitle,
      taken,
    )
    headings.set(action.id, title)
    taken.add(title)
  }
}

function actionReferenceHeadings(
  actions: readonly (
    | MonsterAction
    | MonsterBonusAction
    | MonsterReaction
    | MonsterLegendaryAction
  )[],
  spells: SpellDisplayContext,
): Map<string, string> {
  if (!actions.some((action) => action.kind === 'action-reference')) return new Map()
  const sourceTitles = referenceSourceTitles(spells)
  const taken = new Set<string>()
  const headings = new Map<string, string>()
  assignReferenceHeadings(actions, sourceTitles, headings, taken, true)
  assignReferenceHeadings(actions, sourceTitles, headings, taken, false)
  return headings
}

function mapGeneratedBonusAction(
  action: Extract<MonsterBonusAction, { kind: 'leap' | 'teleport' | 'take-actions' }>,
  name: string,
  monsterName: string,
): MonsterActionItemViewModel {
  const body =
    action.kind === 'leap'
      ? formatMonsterLeap({
          monsterName,
          distanceFeet: action.distanceFeet,
          movementFeet: action.movementFeet,
        })
      : action.kind === 'teleport'
        ? formatMonsterTeleport({
            monsterName,
            distanceFeet: action.distanceFeet,
            passenger: action.passenger,
          })
        : formatMonsterTakeActions({
            monsterName,
            standardActions: action.standardActions,
            combination: action.combination,
            restriction: action.restriction,
          })
  return {
    id: action.id,
    name,
    descriptionHtml: body ? `<p>${escapeStatBlockText(body)}</p>` : undefined,
  }
}

function isGeneratedBonusAction(
  action: MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
): action is Extract<MonsterBonusAction, { kind: 'leap' | 'teleport' | 'take-actions' }> {
  return action.kind === 'leap' || action.kind === 'teleport' || action.kind === 'take-actions'
}

function mapSpecialActionItem(
  action: Extract<MonsterAction | MonsterReaction, { kind: 'special' }>,
  name: string,
  derived: DerivedMonsterStatBlock | null | undefined,
  spells: SpellDisplayContext,
): MonsterActionItemViewModel {
  const paragraph = proseSavingThrowParagraph(spells.monster, action.savingThrow, derived)
  return {
    id: action.id,
    name,
    descriptionHtml: withTurnLimit(
      joinRulesAndSavingThrow(action.description, paragraph),
      action,
      spells.monsterName,
      true,
      Boolean(paragraph),
    ),
  }
}

function mapParryActionItem(
  action: Extract<MonsterReaction, { kind: 'parry' }>,
  name: string,
  spells: SpellDisplayContext,
): MonsterActionItemViewModel {
  const response = formatMonsterParryResponse({
    monsterName: spells.monsterName,
    acBonus: action.acBonus,
    followUpAttackName: parryFollowUpName(action, spells),
  })
  return {
    id: action.id,
    name,
    descriptionHtml: response ? `<p>${escapeStatBlockText(response)}</p>` : undefined,
  }
}

function mapAttackActionItem(
  action: MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
  section: DerivedMonsterAttackLine['section'],
  name: string,
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
): MonsterActionItemViewModel {
  const attack = findAttackLine(derived, section, action.id)
  return {
    id: action.id,
    name,
    attackLine: resolveActionAttackLine(catalogState, attack),
    descriptionHtml:
      'description' in action
        ? withTurnLimit(action.description, action, spells.monsterName, true)
        : undefined,
  }
}

function mapActionItemBody(
  action: MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
  section: DerivedMonsterAttackLine['section'],
  name: string,
  identityName: string,
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
): MonsterActionItemViewModel {
  if (action.kind === 'spell') {
    return mapSpellActionItem(action, section, derived, spells, identityName)
  }
  if (action.kind === 'special') return mapSpecialActionItem(action, name, derived, spells)
  if (action.kind === 'save') {
    return mapSaveActionItem(action, name, derived, catalogState, spells, identityName)
  }
  if (action.kind === 'action-reference') return mapActionReferenceItem(action, name, spells)
  if (isGeneratedBonusAction(action))
    return mapGeneratedBonusAction(action, name, spells.monsterName)
  if (action.kind === 'parry') return mapParryActionItem(action, name, spells)
  if (action.kind === 'multiattack') {
    return mapMultiattackActionItem(action, name, derived, catalogState, spells)
  }
  return mapAttackActionItem(action, section, name, derived, catalogState, spells)
}

function mapActionItem(
  action: MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
  section: DerivedMonsterAttackLine['section'],
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
  referenceHeadings: ReadonlyMap<string, string>,
): MonsterActionItemViewModel {
  const identity = actionDisplayIdentity(
    action,
    spells.monster,
    spells.equipmentById,
    spells.catalogState,
    spells.magicPropertyProvider,
  )
  const heading =
    action.kind === 'action-reference'
      ? (referenceHeadings.get(action.id) ?? identity.displayName)
      : identity.displayName
  const name = withLimitedUseHeading(
    heading,
    'limitedUse' in action ? action.limitedUse : undefined,
  )
  return mapActionItemBody(
    action,
    section,
    name,
    identity.displayName,
    derived,
    catalogState,
    spells,
  )
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
  spells: SpellDisplayContext,
): MonsterActionItemViewModel[] {
  const headings = actionReferenceHeadings(actions, spells)
  return actions.map((action) =>
    mapActionItem(action, section, derived, catalogState, spells, headings),
  )
}

function mapReactionItems(
  reactions: readonly MonsterReaction[],
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
): MonsterActionItemViewModel[] {
  const headings = actionReferenceHeadings(reactions, spells)
  return reactions.map((action) => {
    const triggerText =
      action.kind === 'parry' ? formatMonsterParryTrigger(spells.monsterName) : action.trigger?.text
    return reactionItemView(
      mapActionItem(action, 'reactions', derived, catalogState, spells, headings),
      triggerText,
    )
  })
}

function reactionItemView(
  base: MonsterActionItemViewModel | undefined,
  triggerText: string | undefined,
): MonsterActionItemViewModel {
  const hasBody = Boolean(base?.attackLine || base?.descriptionHtml)
  return {
    id: base?.id ?? '',
    name: base?.name ?? '',
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

function escapeTraitSentence(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
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
  const formatted = formatCreatureTrait({
    subject: formatMonsterStatBlockSubject(monsterName),
    trait: trait as Parameters<typeof formatCreatureTrait>[0]['trait'],
  })
  return {
    id: trait.id,
    name: formatted?.name ?? record.preset,
    descriptionHtml: formatted ? `<p>${escapeTraitSentence(formatted.sentence)}</p>` : '',
  }
}

function mapTemplateMonsterTrait(
  trait: Monster['traits'][number],
  record: Record<string, unknown>,
  monsterName: string,
): MonsterTraitItemViewModel | undefined {
  if (record.kind !== 'template' || typeof record.templateId !== 'string') return undefined
  const nameOverride = typeof record.nameOverride === 'string' ? record.nameOverride : undefined
  const display = resolveTraitDisplay({
    kind: 'template',
    id: trait.id,
    templateId: record.templateId,
    config: record.config,
    nameOverride,
  })
  const sentence = formatMonsterTemplateSentence({
    templateId: record.templateId,
    config: record.config,
    monsterName,
  })
  const extra =
    typeof record.descriptionOverride === 'string' && record.descriptionOverride.trim()
      ? record.descriptionOverride
      : ''
  const generated = sentence
    ? `<p>${escapeTraitSentence(sentence)}</p>`
    : (display.descriptionHtml ?? '')
  return {
    id: trait.id,
    name: nameOverride?.trim() || display.name,
    descriptionHtml: extra ? `${generated}${extra}` : generated,
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
  return (
    mapPresetMonsterTrait(trait, record, monster.name) ??
    mapTemplateMonsterTrait(trait, record, monster.name) ??
    mapNamedMonsterTrait(trait, record, monster, derived)
  )
}

export function buildMonsterDetailViewModel({
  monster,
  creatureTypeLabel,
  equipmentById,
  catalogState,
  derived,
  spellsById,
  spellCatalogStatus = 'unavailable',
  magicPropertyProvider = () => undefined,
}: BuildMonsterDetailViewModelInput): MonsterDetailViewModel {
  const spellContext = {
    monster,
    equipmentById,
    monsterName: monster.name,
    spellsById,
    catalogStatus: spellCatalogStatus,
    catalogState,
    magicPropertyProvider,
    spellsInBody: new Map(
      availableBodyRows([
        ...monster.actions,
        ...monster.bonusActions,
        ...monster.reactions,
        ...monster.legendaryActions,
      ])
        .filter((action) => action.kind === 'spell')
        .map((action) => [action.id, action]),
    ),
  }
  const sizeLabel = formatCreatureSizeList(monster.sizes)
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
    traits: monster.traits
      .filter((trait) => {
        const available = (trait as { available?: boolean }).available
        return available !== false
      })
      .map((trait) => mapMonsterTrait(trait, monster, derived)),
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
      availableBodyRows(monster.legendaryActions),
      'legendaryActions',
      derived,
      catalogState,
      spellContext,
    ),
    legendaryActionsIntro:
      availableBodyRows(monster.legendaryActions).length > 0 &&
      monster.legendaryActionUses !== undefined
        ? formatLegendaryActionUsesIntro({
            monsterName: monster.name,
            uses: monster.legendaryActionUses,
            usesInLair: monster.legendaryActionUsesInLair,
          })
        : undefined,
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
