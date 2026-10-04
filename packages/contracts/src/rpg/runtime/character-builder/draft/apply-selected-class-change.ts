import { choiceSetIdIsOwnedBy } from '../choice-set'
import type { CharacterBuildContext } from '../context'
import { resolvePlayableBuilderContent } from '../preview/resolve-playable-builder-content'
import { isEquipmentPickerSupportedEquipment } from '../resolvers/picker/equipment-picker-supported-kinds'
import { pruneInvalidBuilderSelections } from './prune-invalid-builder-selections'
import type {
  CharacterBuilderDraft,
  CharacterBuilderDraftEquipment,
  CharacterBuilderDraftEquipmentPurchase,
} from './draft'

const CLASS_OWNED_CHOICE_SOURCE_TYPES = ['class', 'spellcasting'] as const

export type EquipmentClassChangeContext = {
  classId?: string
  level: number
}

function sameClassId(previous: string | undefined, next: string | undefined): boolean {
  return (previous || undefined) === (next || undefined)
}

function playablePickerEquipmentIds(context: CharacterBuildContext): Set<string> {
  return new Set(
    resolvePlayableBuilderContent(context)
      .equipment.filter((equipment) => isEquipmentPickerSupportedEquipment(equipment))
      .map((equipment) => equipment.id),
  )
}

function isUserOwnedPurchase(purchase: CharacterBuilderDraftEquipmentPurchase): boolean {
  switch (purchase.sourceMode) {
    case 'manual':
      return true
    case 'startingGold':
      switch (purchase.origin) {
        case 'picker':
          return true
        case 'packageConversion':
          return false
      }
  }
}

/**
 * Sole authority over which purchases survive a class change. Manual rows and
 * picker rows that are still playable catalog items stay unchanged.
 * Package-conversion rows belong to the previous class and drop. Grants, the
 * package selection, and package-edit flags reset. Proficiency does not remove
 * a retained purchase.
 */
export function reconcileEquipmentForClassChange(args: {
  equipment: CharacterBuilderDraftEquipment | undefined
  previous: EquipmentClassChangeContext
  next: EquipmentClassChangeContext
  context: CharacterBuildContext
}): CharacterBuilderDraftEquipment | undefined {
  if (!args.equipment) return args.equipment
  if (sameClassId(args.previous.classId, args.next.classId)) return args.equipment

  const playableEquipmentIds = playablePickerEquipmentIds(args.context)
  return {
    ...args.equipment,
    mode: 'package',
    purchases: args.equipment.purchases.filter(
      (purchase) => isUserOwnedPurchase(purchase) && playableEquipmentIds.has(purchase.equipmentId),
    ),
    grants: [],
    classPackage: { state: 'unresolved' },
    editedSincePackageSelection: false,
    skipped: false,
  }
}

/**
 * Switches the selected class and drops state owned by the previous class.
 * Selections are pruned, then equipment is reconciled. The next fill resolves
 * the new class from scratch.
 */
export function applySelectedClassChange(args: {
  draft: CharacterBuilderDraft
  nextClassId: string | undefined
  context: CharacterBuildContext
}): CharacterBuilderDraft {
  if ((args.draft.class.classId ?? undefined) === (args.nextClassId || undefined)) {
    return args.draft
  }

  const candidateDraft: CharacterBuilderDraft = {
    ...args.draft,
    class: {
      ...args.draft.class,
      classId: args.nextClassId || undefined,
    },
  }
  const { nextDraft } = pruneInvalidBuilderSelections(candidateDraft, args.context)

  return {
    ...nextDraft,
    equipment: reconcileEquipmentForClassChange({
      equipment: nextDraft.equipment,
      previous: {
        classId: args.draft.class.classId,
        level: args.draft.class.level,
      },
      next: {
        classId: args.nextClassId,
        level: args.draft.class.level,
      },
      context: args.context,
    }),
  }
}

/**
 * Drops starting-choice overrides granted by the previous class, including
 * nested starting-equipment pools. Overrides for the next class and for
 * other owners stay.
 */
export function dropClassOwnedChoiceOverrides(args: {
  overrides: Readonly<Record<string, readonly string[]>>
  previousClassId: string | undefined
  nextClassId: string | undefined
}): Record<string, string[]> {
  const previousClassId = args.previousClassId || undefined
  const nextClassId = args.nextClassId || undefined
  if (!previousClassId || previousClassId === nextClassId) {
    return Object.fromEntries(
      Object.entries(args.overrides).map(([choiceSetId, selectedIds]) => [
        choiceSetId,
        [...selectedIds],
      ]),
    )
  }

  const retained: Record<string, string[]> = {}
  for (const [choiceSetId, selectedIds] of Object.entries(args.overrides)) {
    const ownedByPreviousClass = CLASS_OWNED_CHOICE_SOURCE_TYPES.some((sourceType) =>
      choiceSetIdIsOwnedBy(choiceSetId, sourceType, previousClassId),
    )
    if (ownedByPreviousClass) continue
    retained[choiceSetId] = [...selectedIds]
  }
  return retained
}
