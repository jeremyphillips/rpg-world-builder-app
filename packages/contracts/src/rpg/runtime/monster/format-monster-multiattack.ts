import type { MonsterAction } from '../../content/monster/action'
import type { CreatureEquipmentCatalog } from '../creature/equipment'
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

function attackName(
  id: string,
  actions: readonly MonsterAction[],
  equipment: readonly { entryId: string; equipmentId: string }[],
  equipmentCatalog: CreatureEquipmentCatalog,
): string {
  const action = actions.find((entry) => entry.id === id)
  if (!action) return id
  if (action.kind === 'weapon') {
    const equipmentId = equipment.find(
      (entry) => entry.entryId === action.equipmentEntryId,
    )?.equipmentId
    const item = equipmentId ? equipmentCatalog.get(equipmentId) : undefined
    return action.name ?? item?.name ?? id
  }
  if ('name' in action && action.name) return action.name
  return id
}

function combinationPhrase(names: readonly string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} or ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, or ${names[names.length - 1]}`
}

function formatStep(args: { subject: string; count: number; names: readonly string[] }): string {
  const countLabel = countWord(args.count)
  if (args.names.length === 1) {
    const name = args.names[0]
    const noun = args.count === 1 ? 'attack' : 'attacks'
    return `${args.subject} makes ${countLabel} ${name} ${noun}.`
  }
  const noun = args.count === 1 ? 'attack' : 'attacks'
  return `${args.subject} makes ${countLabel} ${noun}, using ${combinationPhrase(args.names)} in any combination.`
}

/** SRD sentence for a multiattack, using resolved action and weapon names. */
export function formatMonsterMultiattack(args: {
  monsterName: string
  action: MultiattackAction
  actions: readonly MonsterAction[]
  equipment: readonly { entryId: string; equipmentId: string }[]
  equipmentCatalog: CreatureEquipmentCatalog
}): string {
  const subject = formatMonsterStatBlockSubject(args.monsterName)
  const capitalSubject = subject.charAt(0).toUpperCase() + subject.slice(1)
  const sentences = args.action.steps.map((step) =>
    formatStep({
      subject: capitalSubject,
      count: step.count,
      names: step.actionIds.map((id) =>
        attackName(id, args.actions, args.equipment, args.equipmentCatalog),
      ),
    }),
  )
  const generated = sentences.join(' ')
  const description = args.action.description?.replace(/<[^>]+>/g, '').trim()
  return description ? `${generated} ${description}` : generated
}
