import {
  availableStartingEquipmentOptions,
  classPackageChoiceSchema,
  declineClassPackage,
  formatStartingEquipmentPackageDescription,
  formatWealth,
  indexCharacterBuildCatalog,
  isClassPackageCustomized,
  isClassProgressionApplicable,
  isStartingGoldOption,
  normalizeClassPackageChoice,
  readClassPackageChoice,
  readSelectedStartingEquipmentOptionId,
  resolvePackageEntryQuantity,
  resolveStartingWealthTierForBuilder,
  selectClassPackage,
  setPackageEntryQuantity,
  UNRESOLVED_CLASS_PACKAGE,
  characterWealthFromGrant,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ClassPackageChoice,
  type StartingEquipmentOption,
  type StartingEquipmentOptionSummary,
  type StartingEquipmentOptionSummaryItem,
} from '@rpg/contracts'

import { countStartingEquipmentRadioOptions } from '@/features/character/lib/equipment/equipment-step.lib'

import type { QuickNpcSetupValues } from './quick-npc-form-fields'

export const QUICK_NPC_PACKAGE_CUSTOMIZED_LABEL = 'Customized'
export const QUICK_NPC_PACKAGE_ACTIONS_LABEL = 'Package actions'
export const QUICK_NPC_CUSTOMIZE_PACKAGE_LABEL = 'Customize package'
export const QUICK_NPC_EDIT_CUSTOMIZATION_LABEL = 'Edit customization'
export const QUICK_NPC_REMOVE_PACKAGE_LABEL = 'Remove package'
export const QUICK_NPC_RESTORE_PACKAGE_DEFAULTS_LABEL = 'Restore package defaults'
export const QUICK_NPC_NO_STARTING_PACKAGE_HEADING = 'No starting package'
export const QUICK_NPC_NO_STARTING_PACKAGE_BODY =
  "Choose a class equipment package, or build the NPC's equipment manually."
export const QUICK_NPC_CHOOSE_PACKAGE_LABEL = 'Choose package'
export const QUICK_NPC_PACKAGE_SECTION_DESCRIPTION =
  'Recommended equipment for this class. You can change, customize, or remove it.'
export const QUICK_NPC_NO_ITEMS_KEPT_DESCRIPTION = 'No items kept from this package.'
export const QUICK_NPC_CUSTOMIZE_DESCRIPTION =
  'Adjust what this NPC keeps from the selected package.'
export const QUICK_NPC_REMOVED_LABEL = 'Removed'
export const QUICK_NPC_REMOVE_LABEL = 'Remove'
export const QUICK_NPC_RESTORE_LABEL = 'Restore'
export const QUICK_NPC_RESTORE_ALL_LABEL = 'Restore all'
export const QUICK_NPC_CANCEL_LABEL = 'Cancel'
export const QUICK_NPC_SAVE_CUSTOMIZATION_LABEL = 'Save customization'
export const QUICK_NPC_EDITING_LOCK_MESSAGE = 'Save or cancel your package changes to continue.'
export const QUICK_NPC_CATEGORY_NO_PACKAGE_SUMMARY = 'No starting package'
export const QUICK_NPC_DECLINED_ADDITIONAL_EQUIPMENT_DESCRIPTION =
  'Add the items this NPC should start with.'

export type QuickNpcPackageCustomizationRow = {
  entryId: string
  label: string
  packageQuantity: number
  retainedQuantity: number
  kind: 'singleton' | 'stack'
  equipmentId?: string
  /** Warning sentence from the shared advisory index. Owned rows only. */
  advisoryLabel?: string
}

export function quickNpcUsePackageLabel(packageLabel: string): string {
  return `Use ${packageLabel}`
}

export function quickNpcCustomizeHeading(packageLabel: string): string {
  return `Customize ${packageLabel}`
}

export function quickNpcQuantityAriaLabel(item: string, packageLabel: string): string {
  return `Quantity of ${item} kept from ${packageLabel}`
}

export function quickNpcRemoveAriaLabel(item: string, packageLabel: string): string {
  return `Remove ${item} from ${packageLabel}`
}

export function quickNpcRestoreAriaLabel(item: string): string {
  return `Restore ${item}`
}

export function quickNpcWealthNote(wealthLabel: string): string {
  return `Also includes ${wealthLabel}. Starting wealth isn't customized here.`
}

export function quickNpcAllRemovedWithWealthNote(wealthLabel: string): string {
  return `Every item is removed. This package will only add ${wealthLabel}.`
}

export const QUICK_NPC_ALL_REMOVED_WITHOUT_WEALTH_NOTE =
  'Every item is removed. To start without a package, choose Remove package instead.'

export function classReplacesStartingPackages(
  context: CharacterBuildContext,
  level: number,
): boolean {
  const tier = resolveStartingWealthTierForBuilder(
    context.characterCreationRules.startingWealth,
    level,
  )
  return tier?.includeNormalStartingEquipment === false
}

export function listQuickNpcPackageOptions(
  context: CharacterBuildContext,
  classId: string | undefined,
): StartingEquipmentOption[] {
  if (!classId) return []
  const characterClass = indexCharacterBuildCatalog(context.catalog).classes.get(classId)
  const options = characterClass?.characterCreation?.startingEquipment?.options ?? []
  return availableStartingEquipmentOptions(options).filter(
    (option) => !isStartingGoldOption(option),
  )
}

export function readQuickNpcClassPackage(value: unknown): ClassPackageChoice {
  const parsed = classPackageChoiceSchema.safeParse(value ?? UNRESOLVED_CLASS_PACKAGE)
  return parsed.success ? parsed.data : UNRESOLVED_CLASS_PACKAGE
}

export function resolveQuickNpcFormClassPackage(args: {
  choice: ClassPackageChoice | undefined
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): ClassPackageChoice {
  const choice = args.choice ?? UNRESOLVED_CLASS_PACKAGE
  if (!isClassProgressionApplicable(args.setup.level) || !args.setup.classId) {
    return UNRESOLVED_CLASS_PACKAGE
  }
  if (classReplacesStartingPackages(args.context, args.setup.level)) return UNRESOLVED_CLASS_PACKAGE
  const options = listQuickNpcPackageOptions(args.context, args.setup.classId)
  if (options.length === 0) return UNRESOLVED_CLASS_PACKAGE
  if (choice.state === 'selected' && choice.intent === 'automatic') return UNRESOLVED_CLASS_PACKAGE
  if (choice.state === 'unavailable') return UNRESOLVED_CLASS_PACKAGE
  if (choice.state !== 'selected') return choice
  const option = options.find((entry) => entry.id === choice.packageId)
  if (!option) return UNRESOLVED_CLASS_PACKAGE
  return normalizeClassPackageChoice({ choice, option })
}

/** Derived automatic selection merged with the form's explicit intent. */
export function resolveQuickNpcEffectiveClassPackage(args: {
  formChoice: ClassPackageChoice | undefined
  draft: CharacterBuilderDraft
  setup: QuickNpcSetupValues
  context: CharacterBuildContext
}): ClassPackageChoice {
  const formChoice = resolveQuickNpcFormClassPackage({
    choice: args.formChoice,
    setup: args.setup,
    context: args.context,
  })
  if (formChoice.state === 'declined' || formChoice.state === 'selected') return formChoice

  const options = listQuickNpcPackageOptions(args.context, args.setup.classId)
  if (
    options.length === 0 ||
    !isClassProgressionApplicable(args.setup.level) ||
    classReplacesStartingPackages(args.context, args.setup.level)
  ) {
    return { state: 'unavailable' }
  }

  const classId = args.setup.classId
  if (!classId) return { state: 'unavailable' }
  const packageId = readSelectedStartingEquipmentOptionId(args.draft, classId)
  if (!packageId || !options.some((option) => option.id === packageId)) {
    return readClassPackageChoice(args.draft.equipment).state === 'unavailable'
      ? { state: 'unavailable' }
      : UNRESOLVED_CLASS_PACKAGE
  }
  return selectClassPackage(packageId, 'automatic')
}

function itemEquipmentId(item: StartingEquipmentOptionSummaryItem): string | undefined {
  if (item.kind === 'grant') return item.equipmentId
  if (item.kind === 'proficiency_linked_grant' && item.status === 'resolved') {
    return item.resolvedEquipment?.id
  }
  return undefined
}

function itemLabel(item: StartingEquipmentOptionSummaryItem, fallback: string): string {
  if (item.kind === 'grant') return item.equipment?.name ?? item.equipmentSlug
  if (item.kind === 'choice') return item.poolLabel || fallback
  if (item.status === 'resolved' && item.resolvedEquipment) return item.resolvedEquipment.name
  return item.choiceLabel || fallback
}

export function buildQuickNpcPackageCustomizationRows(args: {
  option: StartingEquipmentOption
  orderedItems: readonly StartingEquipmentOptionSummaryItem[]
  entryQuantities: Record<string, number>
}): QuickNpcPackageCustomizationRow[] {
  return args.option.items.flatMap((item, index) => {
    const summary = args.orderedItems[index]
    if (!summary) return []
    const packageQuantity = item.kind === 'grant' ? (item.quantity ?? 1) : 1
    const equipmentId = itemEquipmentId(summary)
    return [
      {
        entryId: item.id,
        label: itemLabel(summary, item.id),
        packageQuantity,
        retainedQuantity: resolvePackageEntryQuantity(
          packageQuantity,
          item.id,
          args.entryQuantities,
        ),
        kind: packageQuantity > 1 ? 'stack' : 'singleton',
        ...(equipmentId ? { equipmentId } : {}),
      },
    ]
  })
}

export function formatQuickNpcEffectivePackageDescription(args: {
  option: StartingEquipmentOption
  orderedItems: readonly StartingEquipmentOptionSummaryItem[]
  entryQuantities: Record<string, number>
}): string {
  const retained: StartingEquipmentOptionSummaryItem[] = []
  args.option.items.forEach((item, index) => {
    const summary = args.orderedItems[index]
    if (!summary) return
    const packageQuantity = item.kind === 'grant' ? (item.quantity ?? 1) : 1
    const retainedQuantity = resolvePackageEntryQuantity(
      packageQuantity,
      item.id,
      args.entryQuantities,
    )
    if (retainedQuantity <= 0) return
    if (summary.kind === 'grant') {
      retained.push({ ...summary, quantity: retainedQuantity })
      return
    }
    retained.push(summary)
  })

  if (retained.length === 0 && !args.option.wealth) return QUICK_NPC_NO_ITEMS_KEPT_DESCRIPTION

  return formatStartingEquipmentPackageDescription({
    orderedItems: retained,
    ...(args.option.wealth ? { wealth: args.option.wealth } : {}),
  })
}

export function formatQuickNpcPackageWealthLabel(
  option: StartingEquipmentOption | undefined,
): string | undefined {
  if (!option?.wealth) return undefined
  return formatWealth(characterWealthFromGrant(option.wealth))
}

export function quickNpcPackageDraftQuantities(choice: ClassPackageChoice): Record<string, number> {
  return choice.state === 'selected' ? { ...choice.overrides.entryQuantities } : {}
}

export function setQuickNpcPackageDraftQuantity(args: {
  entryId: string
  packageQuantity: number
  quantity: number
  entryQuantities: Record<string, number>
}): Record<string, number> {
  return setPackageEntryQuantity({
    entryId: args.entryId,
    authoredQuantity: args.packageQuantity,
    quantity: args.quantity,
    overrides: args.entryQuantities,
  })
}

export function removeQuickNpcPackageDraftEntry(args: {
  entryId: string
  packageQuantity: number
  entryQuantities: Record<string, number>
}): Record<string, number> {
  return setQuickNpcPackageDraftQuantity({ ...args, quantity: 0 })
}

export function restoreQuickNpcPackageDraftEntry(args: {
  entryId: string
  entryQuantities: Record<string, number>
}): Record<string, number> {
  const next = { ...args.entryQuantities }
  delete next[args.entryId]
  return next
}

export function quickNpcPackageDraftIsDirty(
  draft: Record<string, number>,
  submitted: Record<string, number>,
): boolean {
  const keys = new Set([...Object.keys(draft), ...Object.keys(submitted)])
  for (const key of keys) {
    if (draft[key] !== submitted[key]) return true
  }
  return false
}

export function quickNpcPackageDraftIsAllDefaults(draft: Record<string, number>): boolean {
  return Object.keys(draft).length === 0
}

export function quickNpcCanChangePackage(args: {
  characterClass: Parameters<typeof countStartingEquipmentRadioOptions>[0]['characterClass']
  summaries: readonly StartingEquipmentOptionSummary[]
}): boolean {
  return (
    countStartingEquipmentRadioOptions({
      characterClass: args.characterClass,
      summaries: args.summaries,
      includeGoldOption: false,
    }) > 1
  )
}

export function declineQuickNpcClassPackage(): ClassPackageChoice {
  return declineClassPackage()
}

export function selectQuickNpcClassPackage(packageId: string): ClassPackageChoice {
  return selectClassPackage(packageId, 'explicit')
}

export function saveQuickNpcPackageCustomization(args: {
  packageId: string
  entryQuantities: Record<string, number>
  option: StartingEquipmentOption | undefined
}): ClassPackageChoice {
  const choice = {
    ...selectClassPackage(args.packageId, 'explicit'),
    overrides: { entryQuantities: args.entryQuantities },
  }
  return normalizeClassPackageChoice({ choice, option: args.option })
}

export function quickNpcPackageIsCustomized(choice: ClassPackageChoice | undefined): boolean {
  return isClassPackageCustomized(choice)
}
