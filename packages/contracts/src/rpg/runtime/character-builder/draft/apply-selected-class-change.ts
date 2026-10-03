import { isStartingGoldOption } from '../../../content/starting-equipment'
import { isEquipmentStackable } from '../../../content/equipment/stackable'
import { findAvailableStartingEquipmentOption } from '../../../content/starting-equipment-availability'
import type { Equipment } from '../../../content/equipment'
import { choiceSetIdIsOwnedBy } from '../choice-set'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../context'
import { resolvePlayableBuilderContent } from '../preview/resolve-playable-builder-content'
import { resolveEffectiveStartingEquipmentPackageItems } from '../resolvers/equipment/derive-equipment-draft-entries'
import { readSelectedStartingEquipmentOptionId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import { isEquipmentPickerSupportedEquipment } from '../resolvers/picker/equipment-picker-supported-kinds'
import { pruneInvalidBuilderSelections } from './prune-invalid-builder-selections'
import type {
  CharacterBuilderDraft,
  CharacterBuilderDraftEquipment,
  CharacterBuilderDraftEquipmentPurchase,
} from './draft'
import type { ResolvedStartingEquipmentItem } from '../assembly/assemble-starting-equipment'

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

function retainedUserCartPurchase(
  purchase: CharacterBuilderDraftEquipmentPurchase,
  playableEquipmentIds: ReadonlySet<string>,
): CharacterBuilderDraftEquipmentPurchase | undefined {
  if (!playableEquipmentIds.has(purchase.equipmentId)) return undefined
  if (purchase.sourceMode === 'manual') return purchase
  if (purchase.sourceMode !== 'startingGold') return undefined
  if (purchase.origin === 'picker') return purchase
  if (purchase.origin === 'packageConversion') {
    return { ...purchase, origin: 'picker' }
  }
  return undefined
}

function retainedPurchasesOnClassChange(
  purchases: readonly CharacterBuilderDraftEquipmentPurchase[],
  context: CharacterBuildContext,
): CharacterBuilderDraftEquipmentPurchase[] {
  const playableEquipmentIds = playablePickerEquipmentIds(context)
  return purchases.flatMap((purchase) => {
    const retained = retainedUserCartPurchase(purchase, playableEquipmentIds)
    return retained ? [retained] : []
  })
}

function resolvedPackageRow(
  item: ResolvedStartingEquipmentItem,
  quantity: number,
): { equipment: Equipment; equipmentId: string; quantity: number } | undefined {
  if (item.kind === 'grant') {
    if (!item.equipment) return undefined
    return { equipment: item.equipment, equipmentId: item.equipmentId, quantity }
  }
  if (item.kind === 'proficiency_linked_grant') {
    if (item.status !== 'resolved' || !item.equipmentId || !item.equipment) return undefined
    return { equipment: item.equipment, equipmentId: item.equipmentId, quantity }
  }
  if (!item.selectedEquipmentId || !item.equipment) return undefined
  return { equipment: item.equipment, equipmentId: item.selectedEquipmentId, quantity }
}

function selectedPackageRows(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): Array<{ equipment: Equipment; equipmentId: string; quantity: number }> {
  const classId = draft.class.classId
  if (!classId) return []

  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const characterClass = catalogIndex.classes.get(classId)
  const startingEquipment = characterClass?.characterCreation?.startingEquipment
  if (!characterClass || !startingEquipment) return []

  const selectedOptionId = readSelectedStartingEquipmentOptionId(draft, classId)
  if (!selectedOptionId) return []

  const option = findAvailableStartingEquipmentOption(startingEquipment.options, selectedOptionId)
  if (!option || isStartingGoldOption(option)) return []

  return resolveEffectiveStartingEquipmentPackageItems(
    draft,
    characterClass,
    option,
    catalogIndex,
  ).flatMap(({ item, quantity }) => {
    const row = resolvedPackageRow(item, quantity)
    return row ? [row] : []
  })
}

function asPendingPickerPurchase(
  purchase: CharacterBuilderDraftEquipmentPurchase,
): CharacterBuilderDraftEquipmentPurchase {
  if (purchase.sourceMode === 'startingGold' && purchase.origin === 'packageConversion') {
    return { ...purchase, origin: 'picker' }
  }
  return purchase
}

function appendPackageRowsToPurchases(
  purchases: readonly CharacterBuilderDraftEquipmentPurchase[],
  rows: readonly { equipment: Equipment; equipmentId: string; quantity: number }[],
): CharacterBuilderDraftEquipmentPurchase[] {
  const next = purchases.map(asPendingPickerPurchase)
  for (const row of rows) {
    const existingIndex = next.findIndex(
      (purchase) =>
        purchase.equipmentId === row.equipmentId &&
        purchase.sourceMode === 'startingGold' &&
        purchase.origin === 'picker' &&
        isEquipmentStackable(row.equipment),
    )
    if (existingIndex >= 0) {
      const existing = next[existingIndex]!
      next[existingIndex] = { ...existing, quantity: existing.quantity + row.quantity }
      continue
    }
    next.push({
      equipmentId: row.equipmentId,
      quantity: row.quantity,
      sourceMode: 'startingGold',
      origin: 'picker',
    })
  }
  return next
}

/**
 * Copies the selected starting package into pending picker purchases before the
 * class id changes. Nested picks and entry quantities are already resolved.
 * Gold-only options contribute no rows. Untagged startingGold rows are left
 * untouched so reconcile can still drop them.
 */
function carrySelectedPackageAsPendingPurchases(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): CharacterBuilderDraft {
  const rows = selectedPackageRows(draft, context)
  const purchases = draft.equipment?.purchases ?? []
  if (rows.length === 0 && !purchases.some((purchase) => purchase.origin === 'packageConversion')) {
    return draft
  }

  return {
    ...draft,
    equipment: {
      mode: 'package',
      purchases: [],
      editedSincePackageSelection: false,
      ...draft.equipment,
      purchases: appendPackageRowsToPurchases(purchases, rows),
    },
  }
}

/**
 * Class-independent equipment retention. Manual purchases, explicit picker-cart
 * rows, and package-conversion rows that are still playable catalog items stay.
 * Conversion rows are retagged `origin: 'picker'` so they no longer point at the
 * previous package. Untagged startingGold rows drop. Class packages, grants,
 * and package-edit flags reset. Proficiency does not remove a retained purchase.
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
    purchases: retainedPurchasesOnClassChange(args.equipment.purchases, args.context),
    grants: [],
    classPackage: { state: 'unresolved' },
    editedSincePackageSelection: false,
    skipped: false,
  }
}

/**
 * Switches the selected class and drops state owned by the previous class.
 * The resolved starting package is copied into the pending cart first, then the
 * package selection itself is cleared. The next fill resolves the new class
 * from scratch.
 */
export function applySelectedClassChange(args: {
  draft: CharacterBuilderDraft
  nextClassId: string | undefined
  context: CharacterBuildContext
}): CharacterBuilderDraft {
  if ((args.draft.class.classId ?? undefined) === (args.nextClassId || undefined)) {
    return args.draft
  }

  const draftWithCarriedPackage = carrySelectedPackageAsPendingPurchases(args.draft, args.context)
  const candidateDraft: CharacterBuilderDraft = {
    ...draftWithCarriedPackage,
    class: {
      ...draftWithCarriedPackage.class,
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
