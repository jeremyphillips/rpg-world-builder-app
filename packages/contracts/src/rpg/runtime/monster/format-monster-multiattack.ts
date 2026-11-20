import type { MonsterAction } from '../../content/monster/action/index'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import type { CreatureEquipmentCatalog } from '../creature/equipment'
import {
  isMultiattackAttackGroup,
  isMultiattackUseClause,
  multiattackPositiveInt,
  type MultiattackAlternative,
  type MultiattackPublishedStep,
  type MultiattackReplacement,
} from '../../content/monster/action/multiattack-schemas'
import { formatSpellCastAtLevelName } from '../../content/spell/format-spell-cast-level'
import { formatCardinalWord, joinNaturalList } from '../../primitives/prose'
import { MOVEMENT_ALLOWANCE_ENTRIES, type MovementAllowance } from '../../vocab/movement-allowance'
import { resolveMonsterActionIdentity } from './resolve-monster-action-identity'
import { formatMonsterStatBlockSubject } from './spell-entry-presentation'
import type { MonsterReferencedSpell } from './reaction-trigger'
import { multiattackIfAvailableSuffix } from './multiattack-if-available'

type MultiattackAction = Extract<MonsterAction, { kind: 'multiattack' }>

const REFERENCE_ATTACK_KINDS = new Set(['weapon', 'natural-weapon', 'attack'])

export type FormatMonsterMultiattackResult =
  | { status: 'ready'; sentence: string }
  | { status: 'unavailable' }

type ActionReference = {
  id?: string
  kind?: string
  name?: string
  description?: string
  onceUntilNextTurn?: boolean
  actionIds: readonly string[]
  movement?: {
    allowance: MovementAllowance
    withoutOpportunityAttacks?: true
  }
}

type FormatContext = {
  monsterName: string
  actions: readonly MonsterAction[]
  bonusActions?: readonly MonsterAction[]
  equipment: readonly EquipmentInstance[]
  equipmentCatalog: CreatureEquipmentCatalog
  magicPropertyProvider?: MagicPropertyDefinitionProvider
  spellsById?: ReadonlyMap<string, MonsterReferencedSpell>
  spellCatalogStatus?: 'ready' | 'unavailable'
}

function sectionRows(ctx: FormatContext): readonly MonsterAction[] {
  return [...ctx.actions, ...(ctx.bonusActions ?? [])]
}

function resolvePeerAction(id: string, ctx: FormatContext): MonsterAction | undefined {
  return sectionRows(ctx).find((entry) => entry.id === id)
}

function referencedActionName(
  id: string,
  ctx: FormatContext,
): { name?: string; kind?: string; action?: MonsterAction } {
  const action = sectionRows(ctx).find((entry) => entry.id === id)
  if (!action) return {}
  const identity = resolveMonsterActionIdentity({
    action,
    equipment: ctx.equipment,
    equipmentCatalog: ctx.equipmentCatalog,
    magicPropertyProvider: ctx.magicPropertyProvider,
    equipmentCatalogStatus: 'ready',
  })
  const name = identity.displayName.trim()
  return {
    name: name.length > 0 ? name : undefined,
    kind: action.kind,
    action,
  }
}

function spellEntryLabel(
  spellAction: Extract<MonsterAction, { kind: 'spell' }>,
  spellId: string,
  ctx: FormatContext,
): string | undefined {
  const entry = spellAction.spells?.find((row) => row.spellId === spellId)
  if (!entry) return undefined
  const catalog = ctx.spellCatalogStatus === 'ready' ? ctx.spellsById?.get(spellId) : undefined
  if (!catalog) return undefined
  return formatSpellCastAtLevelName({
    name: catalog.name,
    castAtLevel: entry.castAtLevel,
    spellLevel: catalog.level,
  })
}

function replacementChoicePhrase(
  choice: { actionId: string; spellId?: string },
  ctx: FormatContext,
): string | undefined {
  const resolved = referencedActionName(choice.actionId, ctx)
  if (!resolved.name || !resolved.kind) return undefined
  if (REFERENCE_ATTACK_KINDS.has(resolved.kind)) {
    return `a ${resolved.name} attack`
  }
  if (resolved.kind === 'spell') {
    const spellAction = resolved.action as Extract<MonsterAction, { kind: 'spell' }>
    if (choice.spellId) {
      const spellName = spellEntryLabel(spellAction, choice.spellId, ctx)
      if (!spellName) return undefined
      return `a use of ${resolved.name} to cast ${spellName}`
    }
    return `a use of ${resolved.name}`
  }
  return `a use of ${resolved.name}`
}

function letterLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

function formatReplacementChoiceList(phrases: readonly string[]): string {
  if (phrases.length === 1) return phrases[0]!
  const allUseOf = phrases.every((phrase) => phrase.startsWith('a use of'))
  const listed = phrases
    .map((phrase, index) => {
      const body = allUseOf ? phrase.replace(/^a use of /, '') : phrase
      return `(${letterLabel(index)}) ${body}`
    })
    .join(' or ')
  return allUseOf ? `a use of ${listed}` : listed
}

function formatReplacementTargetPhrase(
  replacement: MultiattackReplacement,
  replacementCount: number,
  ctx: FormatContext,
): string | undefined {
  if (replacement.attackWord === 'any') return 'any attack'
  if (replacement.replacesActionId) {
    const target = referencedActionName(replacement.replacesActionId, ctx)
    if (!target.name) return undefined
    return `the ${target.name} attack`
  }
  if (replacementCount === 1) return 'one attack'
  return `${formatCardinalWord(replacementCount)} attacks`
}

function formatReplacementPhrase(
  replacement: MultiattackReplacement,
  ctx: FormatContext,
): string | undefined {
  const replacementCount = multiattackPositiveInt(replacement.count)
  const choices = replacement.choices ?? []
  const hasChoices =
    replacementCount &&
    choices.length > 0 &&
    choices.every((choice) => Boolean(choice.actionId?.trim()))
  if (!hasChoices) return undefined

  const phrases = choices.map((choice) => replacementChoicePhrase(choice, ctx))
  if (phrases.some((phrase) => !phrase)) return undefined

  const targetPhrase = formatReplacementTargetPhrase(replacement, replacementCount, ctx)
  if (!targetPhrase) return undefined

  const choiceText = formatReplacementChoiceList(phrases as string[])
  const available = multiattackIfAvailableSuffix(choices, (actionId) =>
    resolvePeerAction(actionId, ctx),
  )
  return `It can replace ${targetPhrase} with ${choiceText}${available}`
}

function formatUseSinglePhrase(
  step: Extract<MultiattackPublishedStep, { kind: 'use'; mode: 'single' }>,
  ctx: FormatContext,
  subjectAlreadyPresent: boolean,
): string | undefined {
  const resolved = referencedActionName(step.actionId, ctx)
  if (!resolved.name) return undefined
  const count = step.count ?? 1
  const verb = step.optional ? 'can use' : 'uses'
  const twice = count === 2 ? ' twice' : ''
  const available = multiattackIfAvailableSuffix(
    [{ actionId: step.actionId, spellId: step.spellId }],
    (actionId) => resolvePeerAction(actionId, ctx),
    { skip: Boolean(step.optional) },
  )
  if (resolved.kind === 'spell' && step.spellId) {
    const spellAction = resolved.action as Extract<MonsterAction, { kind: 'spell' }>
    const spellName = spellEntryLabel(spellAction, step.spellId, ctx)
    if (!spellName) return undefined
    const prefix = subjectAlreadyPresent ? '' : `${capitalizeSubject(ctx.monsterName)} `
    return `${prefix}${verb} ${resolved.name} to cast ${spellName}${twice}${available}`.trim()
  }
  const prefix = subjectAlreadyPresent ? '' : `${capitalizeSubject(ctx.monsterName)} `
  return `${prefix}${verb} ${resolved.name}${twice}${available}`.trim()
}

function formatUseChoicePhrase(
  step: Extract<MultiattackPublishedStep, { kind: 'use'; mode: 'choice' }>,
  ctx: FormatContext,
  subjectAlreadyPresent: boolean,
): string | undefined {
  const names = step.choices.map((choice) => {
    const resolved = referencedActionName(choice.actionId, ctx)
    if (!resolved.name) return undefined
    if (resolved.kind === 'spell' && choice.spellId) {
      const spellAction = resolved.action as Extract<MonsterAction, { kind: 'spell' }>
      const spellName = spellEntryLabel(spellAction, choice.spellId, ctx)
      if (!spellName) return undefined
      return `${resolved.name} to cast ${spellName}`
    }
    return resolved.name
  })
  if (names.some((name) => !name)) return undefined
  const list = joinNaturalList(names as string[], { conjunction: 'or' })
  const available = multiattackIfAvailableSuffix(step.choices, (actionId) =>
    resolvePeerAction(actionId, ctx),
  )
  const prefix = subjectAlreadyPresent ? '' : `${capitalizeSubject(ctx.monsterName)} `
  return `${prefix}uses ${list}${available}`.trim()
}

function attackGroupFragment(
  step: { count: unknown; actionIds: readonly string[] },
  ctx: FormatContext,
): string | undefined {
  if (step.actionIds.length === 0) return undefined
  const stepCount = multiattackPositiveInt(step.count)
  if (!stepCount) return undefined
  const names = step.actionIds.map((id) => referencedActionName(id, ctx).name)
  if (names.some((name) => !name)) return undefined
  const countLabel = formatCardinalWord(stepCount)
  if (step.actionIds.length === 1) {
    const name = names[0]!
    const noun = stepCount === 1 ? 'attack' : 'attacks'
    return `${countLabel} ${name} ${noun}`
  }
  const noun = stepCount === 1 ? 'attack' : 'attacks'
  return `${countLabel} ${noun}, using ${joinNaturalList(names as string[], { conjunction: 'or' })} in any combination`
}

function capitalizeSubject(monsterName: string): string {
  const subject = formatMonsterStatBlockSubject(monsterName)
  return subject.charAt(0).toUpperCase() + subject.slice(1)
}

// fallow-ignore-next-line complexity
function formatPrimarySequence(
  steps: readonly MultiattackPublishedStep[],
  ctx: FormatContext,
): string | undefined {
  if (steps.length === 0) return undefined

  const attackFragments: string[] = []
  const mixedParts: string[] = []
  let hasNonAttack = false

  for (const step of steps) {
    if (isMultiattackAttackGroup(step)) {
      if (step.actionIds.length === 0) continue
      const fragment = attackGroupFragment(step, ctx)
      if (!fragment) return undefined
      if (hasNonAttack) {
        mixedParts.push(`makes ${fragment}`)
      } else {
        attackFragments.push(fragment)
      }
      continue
    }
    if (!isMultiattackUseClause(step)) return undefined
    hasNonAttack = true
    if (step.mode === 'choice') {
      const phrase = formatUseChoicePhrase(
        step,
        ctx,
        mixedParts.length > 0 || attackFragments.length > 0,
      )
      if (!phrase) return undefined
      mixedParts.push(phrase)
      continue
    }
    const phrase = formatUseSinglePhrase(
      step,
      ctx,
      mixedParts.length > 0 || attackFragments.length > 0,
    )
    if (!phrase) return undefined
    mixedParts.push(phrase)
  }

  const subject = capitalizeSubject(ctx.monsterName)

  if (!hasNonAttack) {
    if (attackFragments.length === 0) return undefined
    if (attackFragments.length === 1) {
      return `${subject} makes ${attackFragments[0]}.`
    }
    return `${subject} makes ${joinNaturalList(attackFragments, { conjunction: 'and' })}.`
  }

  const leading =
    attackFragments.length > 0
      ? [`makes ${joinNaturalList(attackFragments, { conjunction: 'and' })}`]
      : []
  const body = [...leading, ...mixedParts]
  if (body.length === 0) return undefined
  return `${subject} ${joinNaturalList(body, { conjunction: 'and' })}.`
}

// fallow-ignore-next-line complexity
function formatAlternativeSequence(
  alternative: MultiattackAlternative,
  ctx: FormatContext,
): string | undefined {
  const steps = alternative.steps
  if (steps.length === 0) return undefined

  const first = steps[0]!
  if (isMultiattackAttackGroup(first)) {
    const fragment = attackGroupFragment(first, ctx)
    if (!fragment) return undefined
    const remaining = steps.slice(1)
    let clause = `, or it makes ${fragment}`
    for (const step of remaining) {
      if (isMultiattackAttackGroup(step)) {
        const part = attackGroupFragment(step, ctx)
        if (!part) return undefined
        clause += ` and ${part}`
      } else if (isMultiattackUseClause(step) && step.mode === 'single') {
        const phrase = formatUseSinglePhrase(step, ctx, true)
        if (!phrase) return undefined
        clause += ` and ${phrase}`
      } else {
        return undefined
      }
    }
    if (alternative.afterUsingActionId) {
      const prereq = referencedActionName(alternative.afterUsingActionId, ctx)
      if (!prereq.name) return undefined
      clause += ` if it used ${prereq.name} this turn`
    }
    return clause
  }

  if (isMultiattackUseClause(first) && first.mode === 'single') {
    const resolved = referencedActionName(first.actionId, ctx)
    if (!resolved.name) return undefined
    const count = first.count ?? 1
    const twice = count === 2 ? ' twice' : ''
    let clause = `, or it uses ${resolved.name}${twice}`
    if (alternative.afterUsingActionId) {
      const prereq = referencedActionName(alternative.afterUsingActionId, ctx)
      if (!prereq.name) return undefined
      clause += ` if it used ${prereq.name} this turn`
    }
    return clause
  }

  return undefined
}

export type FormatMonsterMultiattackInput = FormatContext & {
  action: MultiattackAction
  bonusActions?: readonly MonsterAction[]
}

export function formatMonsterMultiattackResult(
  args: FormatMonsterMultiattackInput,
): FormatMonsterMultiattackResult {
  const provider = args.magicPropertyProvider ?? (() => undefined)
  const ctx: FormatContext = {
    ...args,
    bonusActions: args.bonusActions,
    magicPropertyProvider: provider,
    spellCatalogStatus: args.spellCatalogStatus ?? (args.spellsById ? 'ready' : 'unavailable'),
  }

  const primary = formatPrimarySequence(
    (args.action.steps ?? []) as MultiattackPublishedStep[],
    ctx,
  )
  if (!primary) return { status: 'unavailable' }

  let sentence = primary.replace(/\.$/, '')
  if (args.action.replacement) {
    const replacement = formatReplacementPhrase(
      args.action.replacement as MultiattackReplacement,
      ctx,
    )
    if (!replacement) return { status: 'unavailable' }
    sentence = `${sentence}. ${replacement}`
  }
  if (args.action.alternative) {
    const alternative = formatAlternativeSequence(
      args.action.alternative as MultiattackAlternative,
      ctx,
    )
    if (!alternative) return { status: 'unavailable' }
    sentence = `${sentence}${alternative}`
  }
  if (!sentence.endsWith('.')) sentence = `${sentence}.`
  return { status: 'ready', sentence }
}

/** SRD sentence for a multiattack, using resolved action and weapon names. */
export function formatMonsterMultiattack(args: FormatMonsterMultiattackInput): string {
  const result = formatMonsterMultiattackResult(args)
  return result.status === 'ready' ? result.sentence : ''
}

function movementClause(allowance: MovementAllowance, withoutOpportunityAttacks?: true): string {
  const label = MOVEMENT_ALLOWANCE_ENTRIES[allowance].label
  const phrase = label.charAt(0).toLowerCase() + label.slice(1)
  const opportunity = withoutOpportunityAttacks ? ' without provoking Opportunity Attacks' : ''
  return `moves ${phrase}${opportunity}`
}

function referenceClause(names: readonly string[], kinds: readonly string[]): string {
  if (kinds.length > 0 && kinds.every((kind) => REFERENCE_ATTACK_KINDS.has(kind))) {
    return `makes one ${joinNaturalList(names, { conjunction: 'or' })} attack`
  }
  return `uses ${names[0] ?? ''}`
}

/** Legendary action that uses one Actions row, or one of several attacks. */
export function formatMonsterActionReference(args: {
  monsterName: string
  action: ActionReference
  actions: readonly MonsterAction[]
  equipment: readonly EquipmentInstance[]
  equipmentCatalog: CreatureEquipmentCatalog
  magicPropertyProvider?: MagicPropertyDefinitionProvider
}): string {
  const provider = args.magicPropertyProvider ?? (() => undefined)
  const ctx: FormatContext = {
    monsterName: args.monsterName,
    actions: args.actions,
    equipment: args.equipment,
    equipmentCatalog: args.equipmentCatalog,
    magicPropertyProvider: provider,
  }
  const subject = capitalizeSubject(args.monsterName)
  const targets = args.action.actionIds.map((id) => ({
    name: referencedActionName(id, ctx).name,
    kind: args.actions.find((entry) => entry.id === id)?.kind ?? '',
  }))
  if (targets.length === 0 || targets.some((target) => !target.name)) return ''
  const clause = referenceClause(
    targets.map((target) => target.name ?? ''),
    targets.map((target) => target.kind),
  )
  const movement = args.action.movement
  if (!movement) return `${subject} ${clause}.`
  return `${subject} ${movementClause(movement.allowance, movement.withoutOpportunityAttacks)}, and it ${clause}.`
}
