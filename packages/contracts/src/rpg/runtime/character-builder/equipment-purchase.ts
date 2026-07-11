import type { Equipment } from '../../content/equipment'
import { isEquipmentStackable } from '../../content/equipment/stackable'
import type {
  CharacterBuilderDraft,
  CharacterBuilderDraftEquipmentPurchaseOrigin,
  NormalizedCharacterBuilderDraftEquipmentPurchase,
  PersistedCharacterBuilderDraftEquipmentPurchase,
} from './draft'

export function createEquipmentPurchaseId(): string {
  return crypto.randomUUID()
}

/** Weapons and armor carry row-level equipped state; other kinds ignore it for merge. */
export function equipmentSupportsEquippedState(equipment: Equipment): boolean {
  return equipment.kind === 'weapon' || equipment.kind === 'armor'
}

export function normalizeEquipmentPurchaseModifiers(
  modifiers: PersistedCharacterBuilderDraftEquipmentPurchase['modifiers'],
): string {
  return JSON.stringify(modifiers ?? [])
}

type LegacyPurchaseIdentityFields = Pick<
  PersistedCharacterBuilderDraftEquipmentPurchase,
  'equipmentId' | 'sourceMode' | 'equipped' | 'modifiers'
>

function legacyPurchaseEquivalenceKey(purchase: LegacyPurchaseIdentityFields): string {
  return JSON.stringify({
    equipmentId: purchase.equipmentId,
    sourceMode: purchase.sourceMode,
    equipped: purchase.equipped ?? false,
    modifiers: normalizeEquipmentPurchaseModifiers(purchase.modifiers),
  })
}

/** Index among prior rows sharing the same legacy identity-bearing fields. */
export function occurrenceIndexAmongEquivalentLegacyPurchases(
  purchases: readonly PersistedCharacterBuilderDraftEquipmentPurchase[],
  index: number,
): number {
  const key = legacyPurchaseEquivalenceKey(purchases[index]!)
  let occurrence = 0

  for (let priorIndex = 0; priorIndex < index; priorIndex += 1) {
    if (legacyPurchaseEquivalenceKey(purchases[priorIndex]!) === key) {
      occurrence += 1
    }
  }

  return occurrence
}

/** Stable id for legacy rows missing `id` until hydration persist runs. */
export function createDeterministicLegacyPurchaseId(args: {
  equipmentId: string
  sourceMode: PersistedCharacterBuilderDraftEquipmentPurchase['sourceMode']
  equipped?: boolean
  modifiers?: PersistedCharacterBuilderDraftEquipmentPurchase['modifiers']
  occurrenceIndex: number
}): string {
  return [
    'legacy-purchase',
    args.equipmentId,
    args.sourceMode,
    String(args.equipped ?? false),
    normalizeEquipmentPurchaseModifiers(args.modifiers),
    String(args.occurrenceIndex),
  ].join(':')
}

function deterministicLegacyPurchaseIdForRow(
  purchases: readonly PersistedCharacterBuilderDraftEquipmentPurchase[],
  index: number,
): string {
  const purchase = purchases[index]!
  return createDeterministicLegacyPurchaseId({
    equipmentId: purchase.equipmentId,
    sourceMode: purchase.sourceMode,
    equipped: purchase.equipped,
    modifiers: purchase.modifiers,
    occurrenceIndex: occurrenceIndexAmongEquivalentLegacyPurchases(purchases, index),
  })
}

export function resolveEquipmentPurchaseId(
  purchases: readonly PersistedCharacterBuilderDraftEquipmentPurchase[],
  index: number,
): string {
  const purchase = purchases[index]!
  return purchase.id ?? deterministicLegacyPurchaseIdForRow(purchases, index)
}

export function normalizeEquipmentPurchase(
  purchases: readonly PersistedCharacterBuilderDraftEquipmentPurchase[],
  index: number,
): NormalizedCharacterBuilderDraftEquipmentPurchase {
  const purchase = purchases[index]!
  const origin = purchase.origin ?? 'picker'

  if (purchase.id && purchase.origin !== undefined) {
    if (purchase.origin === origin) {
      return purchase as NormalizedCharacterBuilderDraftEquipmentPurchase
    }
    return { ...purchase, id: purchase.id, origin }
  }

  if (purchase.id) {
    return { ...purchase, id: purchase.id, origin }
  }

  return {
    ...purchase,
    id: deterministicLegacyPurchaseIdForRow(purchases, index),
    origin,
  }
}

export function draftEquipmentPurchasesNeedNormalization(
  purchases: readonly PersistedCharacterBuilderDraftEquipmentPurchase[] | undefined,
): boolean {
  if (!purchases?.length) return false
  return purchases.some((purchase) => !purchase.id || purchase.origin === undefined)
}

export function normalizeCharacterBuilderDraftPurchases(
  draft: CharacterBuilderDraft,
): CharacterBuilderDraft {
  const purchases = draft.equipment?.purchases
  if (!purchases?.length) return draft

  const normalizedPurchases = purchases.map((_, index) =>
    normalizeEquipmentPurchase(purchases, index),
  )

  const changed = normalizedPurchases.some((purchase, index) => purchase !== purchases[index])
  if (!changed) return draft

  return {
    ...draft,
    equipment: {
      ...draft.equipment!,
      purchases: normalizedPurchases,
    },
  }
}

export function normalizeCharacterBuilderDraft(
  draft: CharacterBuilderDraft,
): CharacterBuilderDraft {
  return normalizeCharacterBuilderDraftPurchases(draft)
}

function normalizedEquippedForMerge(
  purchase: Pick<PersistedCharacterBuilderDraftEquipmentPurchase, 'equipped'>,
  equipment: Equipment,
): boolean | undefined {
  if (!equipmentSupportsEquippedState(equipment)) return undefined
  return purchase.equipped ?? false
}

function haveEquivalentSourceMode(
  existing: PersistedCharacterBuilderDraftEquipmentPurchase,
  incoming: Pick<PersistedCharacterBuilderDraftEquipmentPurchase, 'sourceMode' | 'origin'>,
): boolean {
  return (
    existing.sourceMode === incoming.sourceMode &&
    (existing.origin ?? 'picker') === (incoming.origin ?? 'picker')
  )
}

function haveEquivalentModifiers(
  existing: PersistedCharacterBuilderDraftEquipmentPurchase,
  incoming: Pick<PersistedCharacterBuilderDraftEquipmentPurchase, 'modifiers'>,
): boolean {
  return (
    normalizeEquipmentPurchaseModifiers(existing.modifiers) ===
    normalizeEquipmentPurchaseModifiers(incoming.modifiers)
  )
}

function haveEquivalentEquippedState(
  existing: PersistedCharacterBuilderDraftEquipmentPurchase,
  incoming: Pick<PersistedCharacterBuilderDraftEquipmentPurchase, 'equipped'>,
  equipment: Equipment,
): boolean {
  if (!equipmentSupportsEquippedState(equipment)) return true
  return (
    normalizedEquippedForMerge(existing, equipment) ===
    normalizedEquippedForMerge(incoming, equipment)
  )
}

export function canMergeEquipmentPurchases(args: {
  existing: NormalizedCharacterBuilderDraftEquipmentPurchase
  incoming: Pick<
    NormalizedCharacterBuilderDraftEquipmentPurchase,
    'equipmentId' | 'sourceMode' | 'origin' | 'equipped' | 'modifiers'
  >
  equipment: Equipment
}): boolean {
  const { existing, incoming, equipment } = args

  if (!isEquipmentStackable(equipment)) return false
  if (existing.equipmentId !== incoming.equipmentId) return false
  if (!haveEquivalentSourceMode(existing, incoming)) return false
  if (!haveEquivalentModifiers(existing, incoming)) return false
  if (!haveEquivalentEquippedState(existing, incoming, equipment)) return false

  return true
}

/** @deprecated Use {@link canMergeEquipmentPurchases}. */
export const equipmentPurchasesAreMergeCompatible = canMergeEquipmentPurchases

export function findEquipmentPurchaseById(
  purchases: readonly NormalizedCharacterBuilderDraftEquipmentPurchase[],
  purchaseId: string,
): { purchase: NormalizedCharacterBuilderDraftEquipmentPurchase; index: number } | undefined {
  const index = purchases.findIndex((purchase) => purchase.id === purchaseId)
  if (index < 0) return undefined
  return { purchase: purchases[index]!, index }
}

export function resolveEquipmentPurchaseIndex(
  purchases: readonly PersistedCharacterBuilderDraftEquipmentPurchase[],
  purchaseId: string,
): number | undefined {
  const direct = purchases.findIndex((purchase) => purchase.id === purchaseId)
  if (direct >= 0) return direct

  for (let index = 0; index < purchases.length; index += 1) {
    const purchase = purchases[index]!
    if (purchase.id) continue

    const legacyId = deterministicLegacyPurchaseIdForRow(purchases, index)
    if (legacyId === purchaseId) return index
  }

  return undefined
}

export function mergeCompatiblePurchasedEntries(args: {
  purchases: NormalizedCharacterBuilderDraftEquipmentPurchase[]
  incoming: Omit<NormalizedCharacterBuilderDraftEquipmentPurchase, 'id' | 'quantity'> & {
    quantity: number
    origin: CharacterBuilderDraftEquipmentPurchaseOrigin
  }
  equipment: Equipment
  createId?: () => string
}): NormalizedCharacterBuilderDraftEquipmentPurchase[] {
  const { purchases, incoming, equipment, createId = createEquipmentPurchaseId } = args

  const existingIndex = purchases.findIndex((purchase) =>
    canMergeEquipmentPurchases({ existing: purchase, incoming, equipment }),
  )

  if (existingIndex < 0) {
    return [...purchases, { ...incoming, id: createId() }]
  }

  const existing = purchases[existingIndex]!
  return purchases.map((purchase, index) =>
    index === existingIndex
      ? { ...existing, quantity: existing.quantity + incoming.quantity }
      : purchase,
  )
}
