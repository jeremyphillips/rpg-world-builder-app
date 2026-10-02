import type { StartingEquipmentOption } from '../../../../content/starting-equipment'
import { addCustomRefinementIssue } from '../../../../../lib/add-custom-refinement-issue'
import { z } from 'zod'

import type { CharacterBuilderDraft, CharacterBuilderDraftEquipment } from '../../draft/draft'

export const CLASS_PACKAGE_INTENTS = ['automatic', 'explicit'] as const

export type ClassPackageIntent = (typeof CLASS_PACKAGE_INTENTS)[number]

const classPackageEntryQuantitiesSchema = z.record(z.string().min(1), z.number().int().min(0))

const selectedClassPackageChoiceSchema = z
  .object({
    state: z.literal('selected'),
    packageId: z.string().min(1),
    intent: z.enum(CLASS_PACKAGE_INTENTS),
    overrides: z
      .object({
        entryQuantities: classPackageEntryQuantitiesSchema.default({}),
      })
      .default({ entryQuantities: {} }),
  })
  .superRefine((choice, ctx) => {
    if (choice.intent === 'automatic' && Object.keys(choice.overrides.entryQuantities).length > 0) {
      addCustomRefinementIssue(
        ctx,
        'Automatic package selections cannot carry quantity overrides.',
        ['overrides', 'entryQuantities'],
      )
    }
  })

export const classPackageChoiceSchema = z.discriminatedUnion('state', [
  z.object({ state: z.literal('unresolved') }).strict(),
  z.object({ state: z.literal('unavailable') }).strict(),
  z.object({ state: z.literal('declined') }).strict(),
  selectedClassPackageChoiceSchema,
])

export type ClassPackageChoice = z.infer<typeof classPackageChoiceSchema>

export type SelectedClassPackageChoice = Extract<ClassPackageChoice, { state: 'selected' }>

export const UNRESOLVED_CLASS_PACKAGE: ClassPackageChoice = { state: 'unresolved' }

export function selectClassPackage(
  packageId: string,
  intent: ClassPackageIntent,
): SelectedClassPackageChoice {
  return {
    state: 'selected',
    packageId,
    intent,
    overrides: { entryQuantities: {} },
  }
}

export function declineClassPackage(): Extract<ClassPackageChoice, { state: 'declined' }> {
  return { state: 'declined' }
}

export function promoteClassPackageToExplicit(choice: ClassPackageChoice): ClassPackageChoice {
  if (choice.state !== 'selected') return choice
  return {
    ...choice,
    intent: 'explicit',
  }
}

export function isClassPackageCustomized(choice: ClassPackageChoice | undefined): boolean {
  return (
    choice?.state === 'selected' &&
    choice.intent === 'explicit' &&
    Object.keys(choice.overrides.entryQuantities).length > 0
  )
}

export function isClassPackageResolved(
  choice: ClassPackageChoice | undefined,
  options?: { skipped?: boolean },
): boolean {
  if (options?.skipped) return true
  return (
    choice?.state === 'unavailable' || choice?.state === 'declined' || choice?.state === 'selected'
  )
}

export function resolvePackageEntryQuantity(
  authoredQuantity: number,
  entryId: string,
  overrides: Record<string, number> | undefined,
): number {
  const raw = overrides?.[entryId] ?? authoredQuantity
  return Math.min(authoredQuantity, Math.max(0, raw))
}

export function setPackageEntryQuantity(args: {
  entryId: string
  authoredQuantity: number
  quantity: number
  overrides: Record<string, number>
}): Record<string, number> {
  const quantity = Math.min(args.authoredQuantity, Math.max(0, args.quantity))
  const next = { ...args.overrides }
  if (quantity === args.authoredQuantity) {
    delete next[args.entryId]
    return next
  }
  next[args.entryId] = quantity
  return next
}

export function normalizeClassPackageChoice(args: {
  choice: ClassPackageChoice
  option: StartingEquipmentOption | undefined
}): ClassPackageChoice {
  const { choice, option } = args
  if (choice.state !== 'selected' || !option) return choice

  const authored = new Map(
    option.items.map((item) => [item.id, item.kind === 'grant' ? (item.quantity ?? 1) : 1]),
  )
  const entryQuantities: Record<string, number> = {}
  for (const [entryId, quantity] of Object.entries(choice.overrides.entryQuantities)) {
    const authoredQuantity = authored.get(entryId)
    if (authoredQuantity === undefined) continue
    const clamped = Math.min(authoredQuantity, Math.max(0, quantity))
    if (clamped === authoredQuantity) continue
    entryQuantities[entryId] = clamped
  }

  return {
    ...choice,
    overrides: { entryQuantities },
  }
}

export function readClassPackageChoice(
  equipment: CharacterBuilderDraftEquipment | undefined,
): ClassPackageChoice {
  return equipment?.classPackage ?? UNRESOLVED_CLASS_PACKAGE
}

export function equipmentWithClassPackage(
  equipment: CharacterBuilderDraftEquipment | undefined,
  classPackage: ClassPackageChoice,
): CharacterBuilderDraftEquipment {
  return {
    mode: equipment?.mode ?? 'package',
    purchases: equipment?.purchases ?? [],
    grants: equipment?.grants,
    magicItemSelections: equipment?.magicItemSelections,
    editedSincePackageSelection: equipment?.editedSincePackageSelection ?? false,
    skipped: equipment?.skipped,
    classPackage,
  }
}

export function draftWithClassPackage(
  draft: CharacterBuilderDraft,
  classPackage: ClassPackageChoice,
): CharacterBuilderDraft {
  return {
    ...draft,
    equipment: equipmentWithClassPackage(draft.equipment, classPackage),
  }
}
