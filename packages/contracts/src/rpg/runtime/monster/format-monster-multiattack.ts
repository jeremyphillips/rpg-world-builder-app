import type { MonsterAction, MonsterLegendaryAction } from '../../content/monster/action'
import type { MagicPropertyDefinitionProvider } from '../../content/equipment/instance/magic-property'
import type { EquipmentInstance } from '../../content/equipment/instance/instance'
import type { CreatureEquipmentCatalog } from '../creature/equipment'
import { MOVEMENT_ALLOWANCE_ENTRIES, type MovementAllowance } from '../../vocab/movement-allowance'
import { resolveMonsterActionIdentity } from './resolve-monster-action-identity'
import { formatMonsterStatBlockSubject } from './spell-entry-presentation'

type MultiattackAction = Extract<MonsterAction, { kind: 'multiattack' }>

const COUNT_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
] as const

function countWord(count: number): string {
  return COUNT_WORDS[count] ?? String(count)
}

function referencedActionName(
  id: string,
  actions: readonly MonsterAction[],
  equipment: readonly EquipmentInstance[],
  equipmentCatalog: CreatureEquipmentCatalog,
  magicPropertyProvider: MagicPropertyDefinitionProvider,
): string {
  const action = actions.find((entry) => entry.id === id)
  if (!action) return id
  const identity = resolveMonsterActionIdentity({
    action,
    equipment,
    equipmentCatalog,
    magicPropertyProvider,
    equipmentCatalogStatus: 'ready',
  })
  return identity.displayName || id
}

function combinationPhrase(names: readonly string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} or ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, or ${names[names.length - 1]}`
}

function formatAttackClause(args: { count: number; names: readonly string[] }): string {
  const countLabel = countWord(args.count)
  if (args.names.length === 1) {
    const name = args.names[0]
    const noun = args.count === 1 ? 'attack' : 'attacks'
    return `makes ${countLabel} ${name} ${noun}`
  }
  const noun = args.count === 1 ? 'attack' : 'attacks'
  return `makes ${countLabel} ${noun}, using ${combinationPhrase(args.names)} in any combination`
}

function formatStep(args: { subject: string; count: number; names: readonly string[] }): string {
  return `${args.subject} ${formatAttackClause(args)}.`
}

/** SRD sentence for a multiattack, using resolved action and weapon names. */
export function formatMonsterMultiattack(args: {
  monsterName: string
  action: MultiattackAction
  actions: readonly MonsterAction[]
  equipment: readonly EquipmentInstance[]
  equipmentCatalog: CreatureEquipmentCatalog
  magicPropertyProvider?: MagicPropertyDefinitionProvider
}): string {
  const provider = args.magicPropertyProvider ?? (() => undefined)
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capitalSubject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const sentences = args.action.steps.map((step) =>
    formatStep({
      subject: capitalSubject,
      count: step.count,
      names: step.actionIds.map((id) =>
        referencedActionName(id, args.actions, args.equipment, args.equipmentCatalog, provider),
      ),
    }),
  )
  return sentences.join(' ')
}

const REFERENCE_ATTACK_KINDS = new Set(['weapon', 'natural-weapon', 'attack'])

type ActionReference = Extract<MonsterLegendaryAction, { kind: 'action-reference' }>

function movementClause(allowance: MovementAllowance, withoutOpportunityAttacks?: true): string {
  const label = MOVEMENT_ALLOWANCE_ENTRIES[allowance].label
  const phrase = label.charAt(0).toLowerCase() + label.slice(1)
  const opportunity = withoutOpportunityAttacks ? ' without provoking Opportunity Attacks' : ''
  return `moves ${phrase}${opportunity}`
}

function referenceClause(names: readonly string[], kinds: readonly string[]): string {
  if (kinds.length > 0 && kinds.every((kind) => REFERENCE_ATTACK_KINDS.has(kind))) {
    return `makes one ${combinationPhrase(names)} attack`
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
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capitalSubject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const targets = args.action.actionIds.map((id) => ({
    name: referencedActionName(id, args.actions, args.equipment, args.equipmentCatalog, provider),
    kind: args.actions.find((entry) => entry.id === id)?.kind ?? '',
  }))
  const clause = referenceClause(
    targets.map((target) => target.name),
    targets.map((target) => target.kind),
  )
  const movement = args.action.movement
  if (!movement) return `${capitalSubject} ${clause}.`
  return `${capitalSubject} ${movementClause(movement.allowance, movement.withoutOpportunityAttacks)}, and it ${clause}.`
}
