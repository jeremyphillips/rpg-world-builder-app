import {
  dropClassOwnedChoiceOverrides,
  normalizeClassPackageChoice,
  reconcileEquipmentForClassChange,
  UNRESOLVED_CLASS_PACKAGE,
  type CharacterBuildContext,
  type CharacterBuilderDraftEquipment,
  type ClassPackageChoice,
  type SystemRulesetId,
} from '@rpg/contracts'

import type { QuickNpcEquipmentSelection } from './quick-npc-form-fields'
import {
  reconcileQuickNpcEquipmentSelections,
  type QuickNpcEquipmentSeedContext,
} from './quick-npc-equipment-selections.lib'
import {
  listQuickNpcPackageOptions,
  classReplacesStartingPackages,
} from './quick-npc-package-customization.lib'

function nestedPackageOverridePrefix(classId: string, packageId: string): string {
  return `class:${classId}:starting-equipment:${packageId}:`
}

function retainPackageNestedOverrides(args: {
  overrides: Readonly<Record<string, readonly string[]>>
  classId: string | undefined
  packageId: string | undefined
}): Record<string, string[]> {
  if (!args.classId || !args.packageId) return {}
  const prefix = nestedPackageOverridePrefix(args.classId, args.packageId)
  const retained: Record<string, string[]> = {}
  for (const [choiceSetId, selectedIds] of Object.entries(args.overrides)) {
    if (!choiceSetId.startsWith(prefix)) continue
    retained[choiceSetId] = [...selectedIds]
  }
  return retained
}

function manualPurchasesFromSelections(
  equipmentSelections: readonly QuickNpcEquipmentSelection[],
): CharacterBuilderDraftEquipment['purchases'] {
  return equipmentSelections
    .filter((row) => row.origin === 'manual')
    .map((row) => ({
      equipmentId: row.equipmentId,
      quantity: row.quantity,
      sourceMode: 'manual' as const,
    }))
}

function manualSelectionsFromPurchases(
  purchases: CharacterBuilderDraftEquipment['purchases'],
): QuickNpcEquipmentSelection[] {
  return purchases
    .filter((purchase) => purchase.sourceMode === 'manual')
    .map((purchase) => ({
      equipmentId: purchase.equipmentId,
      quantity: purchase.quantity,
      origin: 'manual' as const,
    }))
}

function copyOverrides(
  overrides: Readonly<Record<string, readonly string[]>>,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(overrides).map(([choiceSetId, selectedIds]) => [choiceSetId, [...selectedIds]]),
  )
}

function sameClassPackageChoice(args: {
  choice: ClassPackageChoice
  overrides: Record<string, string[]>
  classId: string | undefined
  context: CharacterBuildContext
}): Pick<
  ReturnType<typeof resolveQuickNpcSetupChangeAuthoringState>,
  'classPackage' | 'startingChoiceOverrides'
> {
  const choice = args.choice
  if (choice.state === 'declined') {
    return { classPackage: choice, startingChoiceOverrides: args.overrides }
  }
  if (choice.state !== 'selected' || choice.intent !== 'explicit') {
    return { classPackage: UNRESOLVED_CLASS_PACKAGE, startingChoiceOverrides: args.overrides }
  }

  const option = listQuickNpcPackageOptions(args.context, args.classId).find(
    (entry) => entry.id === choice.packageId,
  )
  if (!option) {
    return { classPackage: UNRESOLVED_CLASS_PACKAGE, startingChoiceOverrides: args.overrides }
  }

  return {
    classPackage: normalizeClassPackageChoice({ choice, option }),
    startingChoiceOverrides: {
      ...args.overrides,
      ...retainPackageNestedOverrides({
        overrides: args.overrides,
        classId: args.classId,
        packageId: choice.packageId,
      }),
    },
  }
}

function reconcileQuickNpcAuthoringEquipment(args: {
  classPackage: ClassPackageChoice | undefined
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  previous: QuickNpcEquipmentSeedContext
  next: QuickNpcEquipmentSeedContext & { rulesetId: SystemRulesetId }
  context: CharacterBuildContext
}): {
  equipmentSelections: QuickNpcEquipmentSelection[]
  classPackage: ClassPackageChoice | undefined
} {
  const reconciledEquipment = reconcileEquipmentForClassChange({
    equipment: {
      mode: 'package',
      purchases: manualPurchasesFromSelections(args.equipmentSelections),
      classPackage: args.classPackage ?? UNRESOLVED_CLASS_PACKAGE,
      editedSincePackageSelection: false,
    },
    previous: { classId: args.previous.classId, level: args.previous.level },
    next: { classId: args.next.classId, level: args.next.level },
    context: args.context,
  })
  const roleRows = args.equipmentSelections.filter((row) => row.origin === 'role-default')
  return {
    classPackage: reconciledEquipment?.classPackage,
    equipmentSelections: reconcileQuickNpcEquipmentSelections({
      current: [
        ...roleRows,
        ...manualSelectionsFromPurchases(reconciledEquipment?.purchases ?? []),
      ],
      previous: args.previous,
      next: args.next,
    }),
  }
}

function resolveResetClassPackage(args: {
  classChanged: boolean
  reconciledClassPackage: ClassPackageChoice | undefined
}): ClassPackageChoice {
  if (!args.classChanged) return UNRESOLVED_CLASS_PACKAGE
  return args.reconciledClassPackage ?? UNRESOLVED_CLASS_PACKAGE
}

/**
 * Reconciles Quick NPC authoring when setup changes. Replaces the blanket
 * reset for the class package while leaving non-package starting choices on
 * their existing clear-on-edit policy.
 */
export function resolveQuickNpcSetupChangeAuthoringState(args: {
  classPackage: ClassPackageChoice | undefined
  overrides: Readonly<Record<string, readonly string[]>>
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  previous: QuickNpcEquipmentSeedContext
  next: QuickNpcEquipmentSeedContext & { rulesetId: SystemRulesetId }
  context: CharacterBuildContext
}): {
  classPackage: ClassPackageChoice
  startingChoiceOverrides: Record<string, string[]>
  equipmentSelections: QuickNpcEquipmentSelection[]
} {
  const equipment = reconcileQuickNpcAuthoringEquipment(args)
  const classChanged = (args.previous.classId || undefined) !== (args.next.classId || undefined)
  const clearedOverrides = classChanged
    ? dropClassOwnedChoiceOverrides({
        overrides: args.overrides,
        previousClassId: args.previous.classId,
        nextClassId: args.next.classId,
      })
    : copyOverrides(args.overrides)
  const packagesUnavailable =
    args.next.classId === undefined || classReplacesStartingPackages(args.context, args.next.level)
  if (classChanged || packagesUnavailable) {
    return {
      classPackage: resolveResetClassPackage({
        classChanged,
        reconciledClassPackage: equipment.classPackage,
      }),
      startingChoiceOverrides: clearedOverrides,
      equipmentSelections: equipment.equipmentSelections,
    }
  }

  const preserved = sameClassPackageChoice({
    choice: args.classPackage ?? UNRESOLVED_CLASS_PACKAGE,
    overrides: clearedOverrides,
    classId: args.next.classId,
    context: args.context,
  })
  return { ...preserved, equipmentSelections: equipment.equipmentSelections }
}

/** @deprecated Use {@link resolveQuickNpcSetupChangeAuthoringState}. */
export function resolveQuickNpcClassChangeAuthoringState(args: {
  overrides: Readonly<Record<string, readonly string[]>>
  equipmentSelections: readonly QuickNpcEquipmentSelection[]
  previous: QuickNpcEquipmentSeedContext
  next: QuickNpcEquipmentSeedContext & { rulesetId: SystemRulesetId }
  context?: CharacterBuildContext
}): {
  startingChoiceOverrides: Record<string, string[]>
  equipmentSelections: QuickNpcEquipmentSelection[]
} {
  if (!args.context) {
    return {
      startingChoiceOverrides: dropClassOwnedChoiceOverrides({
        overrides: args.overrides,
        previousClassId: args.previous.classId,
        nextClassId: args.next.classId,
      }),
      equipmentSelections: reconcileQuickNpcEquipmentSelections({
        current: args.equipmentSelections,
        previous: args.previous,
        next: args.next,
      }),
    }
  }

  const next = resolveQuickNpcSetupChangeAuthoringState({
    ...args,
    classPackage: UNRESOLVED_CLASS_PACKAGE,
    context: args.context,
  })
  return {
    startingChoiceOverrides: next.startingChoiceOverrides,
    equipmentSelections: next.equipmentSelections,
  }
}
