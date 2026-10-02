import { choiceSetIdIsOwnedBy } from '../choice-set'
import type { CharacterBuildContext } from '../context'
import { pruneInvalidBuilderSelections } from './prune-invalid-builder-selections'
import type { CharacterBuilderDraft, CharacterBuilderDraftEquipment } from './draft'

const CLASS_OWNED_CHOICE_SOURCE_TYPES = ['class', 'spellcasting'] as const

function clearClassOwnedEquipmentChannel(
  equipment: CharacterBuilderDraftEquipment | undefined,
): CharacterBuilderDraftEquipment | undefined {
  if (!equipment) return equipment

  return {
    ...equipment,
    mode: 'package',
    purchases: equipment.purchases.filter((purchase) => purchase.sourceMode === 'manual'),
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
    equipment: clearClassOwnedEquipmentChannel(nextDraft.equipment),
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
