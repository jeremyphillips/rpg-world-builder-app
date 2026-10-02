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

function retainedManualPurchases(
  purchases: readonly CharacterBuilderDraftEquipmentPurchase[],
  context: CharacterBuildContext,
): CharacterBuilderDraftEquipmentPurchase[] {
  const playableEquipmentIds = new Set(
    resolvePlayableBuilderContent(context)
      .equipment.filter((equipment) => isEquipmentPickerSupportedEquipment(equipment))
      .map((equipment) => equipment.id),
  )

  return purchases.filter(
    (purchase) =>
      purchase.sourceMode === 'manual' && playableEquipmentIds.has(purchase.equipmentId),
  )
}

/**
 * Class-independent equipment retention. Manual purchases that are still valid
 * catalog items stay. Class packages, package-derived purchases, and grants reset.
 * Proficiency and recommendation do not remove a manual purchase.
 */
export function reconcileEquipmentForClassChange(args: {
  equipment: CharacterBuilderDraftEquipment | undefined
  previous: EquipmentClassChangeContext
  next: EquipmentClassChangeContext
  context: CharacterBuildContext
}): CharacterBuilderDraftEquipment | undefined {
  if (!args.equipment) return args.equipment
  if (sameClassId(args.previous.classId, args.next.classId)) return args.equipment

  return {
    ...args.equipment,
    mode: 'package',
    purchases: retainedManualPurchases(args.equipment.purchases, args.context),
    grants: [],
    classPackage: { state: 'unresolved' },
    editedSincePackageSelection: false,
    skipped: false,
  }
}

/**
 * Switches the selected class and drops state owned by the previous class.
 * Manual purchases stay. Automatic package and pool selections are not kept
 * for a later switch back; the next fill resolves the new class from scratch.
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
