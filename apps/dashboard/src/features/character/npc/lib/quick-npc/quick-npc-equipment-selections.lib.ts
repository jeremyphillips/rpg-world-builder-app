import {
  getNpcTemplateEntry,
  isClassProgressionApplicable,
  optionIdentitiesOverlap,
  toEquipmentContentId,
  type SystemRulesetId,
} from '@rpg/contracts'

import type { QuickNpcEquipmentSelection } from './quick-npc-form-fields'

export type QuickNpcEquipmentSeedContext = {
  templateId?: string
  classId?: string
  level: number
}

export function usesQuickNpcClassEquipment(classId: string | undefined, level: number): boolean {
  return Boolean(classId) && isClassProgressionApplicable(level)
}

export function buildRoleDefaultEquipmentSelections(args: {
  templateId: string | undefined
  rulesetId: SystemRulesetId
  classId: string | undefined
  level: number
}): QuickNpcEquipmentSelection[] {
  if (!args.templateId || usesQuickNpcClassEquipment(args.classId, args.level)) return []
  const loadout =
    getNpcTemplateEntry(args.templateId)?.recommendations.equipment.defaultLoadout ?? []
  return loadout.map((item) => ({
    equipmentId: toEquipmentContentId(args.rulesetId, item.slug),
    quantity: item.quantity ?? 1,
    origin: 'role-default' as const,
  }))
}

function sameEquipment(left: string, right: string): boolean {
  return optionIdentitiesOverlap(left, right)
}

/**
 * Role changes replace only role-seeded rows. Manual rows survive.
 * A manual row that the new role also defaults is kept and not duplicated.
 */
export function reconcileQuickNpcEquipmentSelections(args: {
  current: readonly QuickNpcEquipmentSelection[]
  previous: QuickNpcEquipmentSeedContext
  next: QuickNpcEquipmentSeedContext & { rulesetId: SystemRulesetId }
}): QuickNpcEquipmentSelection[] {
  const manual = args.current.filter((row) => row.origin === 'manual')
  if (usesQuickNpcClassEquipment(args.next.classId, args.next.level)) return manual

  const templateChanged = args.previous.templateId !== args.next.templateId
  const enteredClassless =
    usesQuickNpcClassEquipment(args.previous.classId, args.previous.level) &&
    !usesQuickNpcClassEquipment(args.next.classId, args.next.level)
  const initial = args.previous.templateId === undefined && args.current.length === 0
  const reseed = templateChanged || enteredClassless || initial

  const roleRows = reseed
    ? buildRoleDefaultEquipmentSelections({
        templateId: args.next.templateId,
        rulesetId: args.next.rulesetId,
        classId: args.next.classId,
        level: args.next.level,
      }).filter((row) => !manual.some((entry) => sameEquipment(entry.equipmentId, row.equipmentId)))
    : args.current.filter((row) => row.origin === 'role-default')

  return [...roleRows, ...manual]
}
