import {
  CHALLENGE_RATING_MECHANICS,
  appendMonsterActionSupplementalText,
  availableBodyRows,
  formatMonsterActionReference,
  formatMonsterAttackAction,
  formatMonsterForms,
  formatMonsterLeap,
  formatMonsterParryResponse,
  formatMonsterSaveAction,
  formatMonsterShapeShift,
  formatMonsterSpellEntry,
  formatMonsterTakeActions,
  formatMonsterTeleport,
  formatOnceUntilNextTurnSentence,
  formatSavingThrowClauses,
  getAbilityLabel,
  isMonsterActionAttackKind,
  monsterActionSectionRows,
  monsterHasFormRestrictions,
  monsterRichTextIsEmpty,
  resolveMonsterActionIdentity,
  resolveProseSavingThrowDc,
  shapeShiftRows,
  type CastingAbility,
  type DerivedMonsterAttackLine,
  type DerivedMonsterStatBlock,
  type Equipment,
  type MagicPropertyDefinitionProvider,
  type Monster,
  type MonsterAction,
  type MonsterActionIdentitySubject,
  type MonsterBonusAction,
  type MonsterLegendaryAction,
  type MonsterReaction,
  type MonsterReferencedSpell,
  formatMonsterMultiattackResult,
  formatOnceUntilNextTurnProse,
  formatSavingThrowClausesProse,
  joinStatBlockProsePlainText,
  monsterAttackActionPartsToProse,
  monsterAttackActionSentenceParts,
  statBlockProseSpacing,
  type MonsterActionKind,
  type StatBlockProse,
  type StatBlockProseDocument,
  type SavingThrowEffect,
} from '@rpg/contracts'

import {
  nextDistinctTitle,
  presentActionReference,
} from '../actions/references/monster-action-reference-presentation'

import { applyMonsterEntryHeadingQualifiers } from './monster-entry-heading'

export const MONSTER_UNRESOLVED_CATALOG_REFERENCE = 'Unresolved reference'

export type MonsterCatalogLoadState = 'pending' | 'ready' | 'error'

export type MonsterActionRulesFacing = {
  id: string
  name: string
  attackLine?: string
  descriptionHtml?: string
  /** Mechanical rules text with typed colon lead-ins — preferred over plain `descriptionHtml`. */
  rulesProse?: StatBlockProseDocument
}

export type SpellDisplayContext = {
  monster: Monster
  equipmentById: ReadonlyMap<string, Equipment>
  monsterName: string
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  catalogStatus: 'ready' | 'unavailable'
  catalogState: MonsterCatalogLoadState
  magicPropertyProvider: MagicPropertyDefinitionProvider
  spellsInBody: Map<string, Extract<MonsterAction | MonsterReaction, { kind: 'spell' }>>
}

export function buildSpellDisplayContext(input: {
  monster: Monster
  equipmentById: ReadonlyMap<string, Equipment>
  catalogState: MonsterCatalogLoadState
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  spellCatalogStatus?: 'ready' | 'unavailable'
  magicPropertyProvider: MagicPropertyDefinitionProvider
}): SpellDisplayContext {
  return {
    monster: input.monster,
    equipmentById: input.equipmentById,
    monsterName: input.monster.name,
    spellsById: input.spellsById,
    catalogStatus: input.spellCatalogStatus ?? 'unavailable',
    catalogState: input.catalogState,
    magicPropertyProvider: input.magicPropertyProvider,
    spellsInBody: new Map(
      availableBodyRows([
        ...input.monster.actions,
        ...input.monster.bonusActions,
        ...input.monster.reactions,
        ...monsterActionSectionRows<MonsterLegendaryAction>(input.monster, 'legendaryActions'),
      ])
        .filter((action) => action.kind === 'spell')
        .map((action) => [action.id, action]),
    ),
  }
}

function findAttackLine(
  derived: DerivedMonsterStatBlock | null | undefined,
  section: DerivedMonsterAttackLine['section'],
  actionId: string,
): DerivedMonsterAttackLine | undefined {
  return derived?.attacks.find((line) => line.section === section && line.id === actionId)
}

function actionDisplayIdentity(
  action: MonsterActionIdentitySubject,
  monster: Monster,
  equipmentById: ReadonlyMap<string, Equipment>,
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

function escapeTraitSentence(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function escapeStatBlockText(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

export function proseSavingThrowParagraph(
  monster: Monster,
  effect: SavingThrowEffect | undefined,
  derived: DerivedMonsterStatBlock | null | undefined,
): string | undefined {
  const prose = proseSavingThrowProse(monster, effect, derived)
  if (!prose) return undefined
  return joinStatBlockProsePlainText(prose)
}

export function proseSavingThrowProse(
  monster: Monster,
  effect: SavingThrowEffect | undefined,
  derived: DerivedMonsterStatBlock | null | undefined,
): StatBlockProse | undefined {
  if (!effect?.ability || !effect.targets.trim() || !effect.failure.trim()) return undefined
  const dc = resolveProseSavingThrowDc({
    source: effect.dcSource,
    proficiencyBonus: proficiencyBonusForDisplay(monster, derived),
    spellcastingAbilityScore:
      effect.dcSource.kind === 'spellcasting'
        ? spellcastingAbilityScore(monster, effect.dcSource.castingAbility)
        : undefined,
  })
  return formatSavingThrowClausesProse({
    abilityLabel: getAbilityLabel(effect.ability),
    dc,
    targets: effect.targets,
    failure: effect.failure,
    success: effect.success,
  })
}

function appendTurnLimitToDocument(
  document: StatBlockProseDocument | undefined,
  action: { kind: string; onceUntilNextTurn?: boolean },
  monsterName: string,
  hasSavingThrow: boolean,
): StatBlockProseDocument | undefined {
  if (action.kind === 'multiattack' || action.onceUntilNextTurn !== true) return document
  const tail = formatOnceUntilNextTurnProse({
    monsterName,
    kind: action.kind,
    hasSavingThrow,
  })
  if (!document || document.length === 0) return [tail]
  const last = document[document.length - 1]
  if (!last || last.length === 0) return [...document, tail]
  return [...document.slice(0, -1), [...last, statBlockProseSpacing(), ...tail]]
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
  if (action.kind === 'multiattack' || action.onceUntilNextTurn !== true) return body
  const sentence = formatOnceUntilNextTurnSentence({
    monsterName,
    kind: action.kind,
    hasSavingThrow,
  })
  if (!body) return html ? `<p>${sentence}</p>` : sentence
  return html ? `${body}<p>${sentence}</p>` : `${body} ${sentence}`
}

function formatSaveActionContent(
  monster: Monster,
  action: Extract<MonsterAction | MonsterReaction, { kind: 'save' }>,
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  displayName: string,
): { rulesProse?: StatBlockProseDocument; fallbackBody?: string } {
  if (catalogState !== 'ready' || !action.resolution || !action.dcSource) {
    if (catalogState === 'error') {
      return { fallbackBody: MONSTER_UNRESOLVED_CATALOG_REFERENCE }
    }
    return {}
  }
  const formatted = formatMonsterSaveAction({
    action: { ...action, resolution: action.resolution, dcSource: action.dcSource },
    name: displayName,
    abilityScores: monster.abilityScores,
    proficiencyBonus: proficiencyBonusForDisplay(monster, derived),
    spellcastingAbilityScore: spellcastingAbilityScoreForSave(monster, action.dcSource),
  })
  return {
    rulesProse: [formatted.bodyProse],
    fallbackBody:
      appendMonsterActionSupplementalText(formatted.body, action.description) || undefined,
  }
}

function formatMultiattackActionBody(
  monster: Monster,
  action: Extract<MonsterAction, { kind: 'multiattack' }>,
  equipmentById: ReadonlyMap<string, Equipment>,
  catalogState: MonsterCatalogLoadState,
  magicPropertyProvider: MagicPropertyDefinitionProvider,
  spells: Pick<SpellDisplayContext, 'spellsById' | 'catalogStatus'>,
): string | undefined {
  if (catalogState !== 'ready') {
    return catalogState === 'error' ? MONSTER_UNRESOLVED_CATALOG_REFERENCE : undefined
  }
  const generated = formatMonsterMultiattackResult({
    monsterName: monster.name,
    action,
    actions: monster.actions,
    bonusActions: monster.bonusActions,
    equipment: monster.equipment,
    equipmentCatalog: equipmentById,
    magicPropertyProvider,
    spellsById: spells.spellsById,
    spellCatalogStatus: spells.catalogStatus,
  })
  const sentence = generated.status === 'ready' ? generated.sentence : ''
  return appendMonsterActionSupplementalText(sentence, action.description) || undefined
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

function mapSpellActionFacing(
  action: Extract<MonsterAction | MonsterReaction | MonsterLegendaryAction, { kind: 'spell' }>,
  section: DerivedMonsterAttackLine['section'],
  derived: DerivedMonsterStatBlock | null | undefined,
  spells: SpellDisplayContext,
  identityName: string,
): MonsterActionRulesFacing {
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
  const rulesProse = appendTurnLimitToDocument(
    rendered.bodyProse,
    action,
    spells.monsterName,
    false,
  )
  const supplemental =
    action.description && !monsterRichTextIsEmpty(action.description)
      ? action.description
      : undefined
  return {
    id: action.id,
    name: rendered.heading,
    rulesProse,
    descriptionHtml: supplemental
      ? withTurnLimit(supplemental, action, spells.monsterName, true)
      : undefined,
  }
}

function mapSaveActionFacing(
  action: Extract<MonsterAction | MonsterReaction, { kind: 'save' }>,
  name: string,
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
  identityName: string,
): MonsterActionRulesFacing {
  const { rulesProse, fallbackBody } = formatSaveActionContent(
    spells.monster,
    action,
    derived,
    catalogState,
    identityName,
  )
  const rulesWithTurn = appendTurnLimitToDocument(rulesProse, action, spells.monsterName, false)
  const mechanical = fallbackBody
    ? withTurnLimit(fallbackBody, action, spells.monsterName, false)
    : undefined
  const supplemental =
    action.description && !monsterRichTextIsEmpty(action.description)
      ? action.description
      : undefined
  const hasStructuredRules = Boolean(rulesWithTurn && rulesWithTurn.length > 0)
  return {
    id: action.id,
    name,
    rulesProse: hasStructuredRules ? rulesWithTurn : undefined,
    descriptionHtml: hasStructuredRules
      ? supplemental
      : mechanical
        ? `<p>${escapeStatBlockText(mechanical)}</p>`
        : withTurnLimit(action.description, action, spells.monsterName, true),
  }
}

function mapActionReferenceFacing(
  action: Extract<MonsterLegendaryAction | MonsterReaction, { kind: 'action-reference' }>,
  name: string,
  spells: SpellDisplayContext,
): MonsterActionRulesFacing {
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
  return { id: action.id, name, descriptionHtml }
}

function mapMultiattackActionFacing(
  action: Extract<MonsterAction, { kind: 'multiattack' }>,
  name: string,
  _derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
): MonsterActionRulesFacing {
  const body = formatMultiattackActionBody(
    spells.monster,
    action,
    spells.equipmentById,
    catalogState,
    spells.magicPropertyProvider,
    spells,
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

export function actionReferenceHeadings(
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

function mapGeneratedBonusActionFacing(
  action: Extract<MonsterBonusAction, { kind: 'leap' | 'teleport' | 'take-actions' }>,
  name: string,
  monsterName: string,
): MonsterActionRulesFacing {
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
  const generated = body ? `<p>${escapeStatBlockText(body)}</p>` : ''
  const supplemental =
    action.description && !monsterRichTextIsEmpty(action.description)
      ? action.description
      : undefined
  const descriptionHtml = supplemental ? `${generated}${supplemental}` : generated || undefined
  return {
    id: action.id,
    name,
    descriptionHtml,
  }
}

function mapSpecialActionFacing(
  action: Extract<MonsterAction | MonsterReaction, { kind: 'special' }>,
  name: string,
  derived: DerivedMonsterStatBlock | null | undefined,
  spells: SpellDisplayContext,
): MonsterActionRulesFacing {
  const saveProse = proseSavingThrowProse(spells.monster, action.savingThrow, derived)
  const rulesProse = appendTurnLimitToDocument(
    saveProse ? [saveProse] : undefined,
    action,
    spells.monsterName,
    Boolean(saveProse),
  )
  const paragraph = proseSavingThrowParagraph(spells.monster, action.savingThrow, derived)
  const hasRules = Boolean(rulesProse && rulesProse.length > 0)
  const supplemental =
    action.description && !monsterRichTextIsEmpty(action.description)
      ? action.description
      : undefined
  return {
    id: action.id,
    name,
    rulesProse: hasRules ? rulesProse : undefined,
    descriptionHtml: hasRules
      ? supplemental
      : withTurnLimit(
          joinRulesAndSavingThrow(action.description, paragraph),
          action,
          spells.monsterName,
          true,
          Boolean(paragraph),
        ),
  }
}

function mapParryActionFacing(
  action: Extract<MonsterReaction, { kind: 'parry' }>,
  name: string,
  spells: SpellDisplayContext,
): MonsterActionRulesFacing {
  const response = formatMonsterParryResponse({
    monsterName: spells.monsterName,
    acBonus: action.acBonus,
    followUpAttackName: parryFollowUpName(action, spells),
  })
  const generated = response ? `<p>${escapeStatBlockText(response)}</p>` : ''
  const supplemental =
    action.description && !monsterRichTextIsEmpty(action.description)
      ? action.description
      : undefined
  const descriptionHtml = supplemental ? `${generated}${supplemental}` : generated || undefined
  return {
    id: action.id,
    name,
    descriptionHtml,
  }
}

function mapAttackActionFacing(
  action: MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
  section: DerivedMonsterAttackLine['section'],
  name: string,
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
): MonsterActionRulesFacing {
  const attack = findAttackLine(derived, section, action.id)
  const attackLine = resolveActionAttackLine(catalogState, attack)
  const parts =
    attack && catalogState === 'ready' ? monsterAttackActionSentenceParts(attack) : undefined
  const rulesProse =
    parts && attackLine !== MONSTER_UNRESOLVED_CATALOG_REFERENCE
      ? [monsterAttackActionPartsToProse(parts)]
      : undefined
  return {
    id: action.id,
    name,
    attackLine: rulesProse ? undefined : attackLine,
    rulesProse,
    descriptionHtml:
      'description' in action
        ? withTurnLimit(action.description, action, spells.monsterName, true)
        : undefined,
  }
}

function mapShapeShiftActionFacing(
  action: Extract<
    MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
    { kind: 'shape-shift' }
  >,
  name: string,
  spells: SpellDisplayContext,
): MonsterActionRulesFacing {
  const generated = spells.monster.forms
    ? formatMonsterShapeShift({
        monsterName: spells.monsterName,
        baseSizes: spells.monster.sizes,
        baseMovement: spells.monster.movement,
        baseHover: spells.monster.hover,
        forms: spells.monster.forms,
        equipment: action.equipment,
        prerequisite: action.prerequisite,
        hasShapeShift: true,
        hasFormRestrictions: monsterHasFormRestrictions(spells.monster),
      })
    : ''
  const description = [generated, action.description].filter(Boolean).join(' ')
  return { id: action.id, name, descriptionHtml: `<p>${escapeStatBlockText(description)}</p>` }
}

// fallow-ignore-next-line complexity
function resolveActionFacingBody(
  action: MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
  section: DerivedMonsterAttackLine['section'],
  name: string,
  identityName: string,
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
): MonsterActionRulesFacing {
  const kind = action.kind as MonsterActionKind
  switch (kind) {
    case 'spell':
      return mapSpellActionFacing(action, section, derived, spells, identityName)
    case 'shape-shift':
      return mapShapeShiftActionFacing(action, name, spells)
    case 'special':
      return mapSpecialActionFacing(action, name, derived, spells)
    case 'save':
      return mapSaveActionFacing(action, name, derived, catalogState, spells, identityName)
    case 'action-reference':
      return mapActionReferenceFacing(action, name, spells)
    case 'leap':
    case 'teleport':
    case 'take-actions':
      return mapGeneratedBonusActionFacing(action, name, spells.monsterName)
    case 'parry':
      return mapParryActionFacing(action, name, spells)
    case 'multiattack':
      return mapMultiattackActionFacing(action, name, derived, catalogState, spells)
    case 'weapon':
    case 'natural-weapon':
    case 'attack':
      return mapAttackActionFacing(action, section, name, derived, catalogState, spells)
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

export function resolveActionStatBlockRulesFacing(
  action: MonsterAction | MonsterBonusAction | MonsterReaction | MonsterLegendaryAction,
  section: DerivedMonsterAttackLine['section'],
  derived: DerivedMonsterStatBlock | null | undefined,
  catalogState: MonsterCatalogLoadState,
  spells: SpellDisplayContext,
  referenceHeadings: ReadonlyMap<string, string>,
): MonsterActionRulesFacing {
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
  const name = applyMonsterEntryHeadingQualifiers(spells.monster, heading, action)
  return resolveActionFacingBody(
    action,
    section,
    name,
    identity.displayName,
    derived,
    catalogState,
    spells,
  )
}

export function resolveActionStatBlockRulesFacingList(
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
): MonsterActionRulesFacing[] {
  const headings = actionReferenceHeadings(actions, spells)
  return actions.map((action) =>
    resolveActionStatBlockRulesFacing(action, section, derived, catalogState, spells, headings),
  )
}

export function formatMonsterFormsTraitFacing(monster: Monster): MonsterActionRulesFacing[] {
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
