import type { CharacterBuildCatalogIndex } from '../../context'
import type {
  CharacterBuilderDraft,
  CharacterBuilderDraftEquipmentPurchase,
} from '../../draft/draft'
import type {
  EquipmentSourceAllocation,
  ResolvedInventoryEntryView,
} from './equipment-acquisition-types'
import type { MagicItemGrantSelection } from '../../equipment/magic-item-selection'
import { readMagicItemSelections } from './resolve-magic-item-grant-progress'

function mergeSourceAllocation(
  sources: EquipmentSourceAllocation[],
  incoming: EquipmentSourceAllocation,
): EquipmentSourceAllocation[] {
  const existingIndex = sources.findIndex(
    (source) =>
      source.kind === incoming.kind &&
      source.sourceId === incoming.sourceId &&
      source.grantId === incoming.grantId &&
      source.allowanceId === incoming.allowanceId,
  )

  if (existingIndex < 0) return [...sources, incoming]

  const existing = sources[existingIndex]!
  return sources.map((source, index) =>
    index === existingIndex
      ? { ...existing, quantity: existing.quantity + incoming.quantity }
      : source,
  )
}

function aggregateEntry(
  views: Map<string, ResolvedInventoryEntryView>,
  equipmentId: string,
  source: EquipmentSourceAllocation,
): void {
  const existing = views.get(equipmentId)
  if (!existing) {
    views.set(equipmentId, {
      equipmentId,
      quantity: source.quantity,
      sources: [source],
    })
    return
  }

  views.set(equipmentId, {
    equipmentId,
    quantity: existing.quantity + source.quantity,
    sources: mergeSourceAllocation(existing.sources, source),
  })
}

function aggregateGrantSelections(
  views: Map<string, ResolvedInventoryEntryView>,
  selections: readonly MagicItemGrantSelection[],
  allowanceSources: ReadonlyMap<string, { sourceId: string; tierId: string }>,
): void {
  for (const selection of selections) {
    const allowanceSource = allowanceSources.get(selection.allowanceId)
    if (!allowanceSource) continue

    aggregateEntry(views, selection.equipmentId, {
      kind: 'startingWealthTier',
      sourceId: allowanceSource.sourceId,
      grantId: allowanceSource.tierId,
      allowanceId: selection.allowanceId,
      quantity: selection.quantity,
    })
  }
}

function aggregatePurchases(
  views: Map<string, ResolvedInventoryEntryView>,
  purchases: readonly CharacterBuilderDraftEquipmentPurchase[],
  purchaseSource: EquipmentSourceAllocation,
): void {
  for (const purchase of purchases) {
    aggregateEntry(views, purchase.equipmentId, {
      ...purchaseSource,
      quantity: purchase.quantity,
    })
  }
}

/** Aggregates canonical per-source rows into display views (quantities sum to total). */
export function resolveInventoryEntryViews(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  classId?: string
  selectedOptionId?: string
  allowanceSources?: ReadonlyMap<string, { sourceId: string; tierId: string }>
}): ResolvedInventoryEntryView[] {
  const { draft, classId, selectedOptionId, allowanceSources = new Map() } = args
  const views = new Map<string, ResolvedInventoryEntryView>()

  aggregateGrantSelections(views, readMagicItemSelections(draft), allowanceSources)

  const purchaseSource: EquipmentSourceAllocation =
    classId && selectedOptionId
      ? { kind: 'startingGold', sourceId: classId, grantId: selectedOptionId, quantity: 0 }
      : { kind: 'manual', quantity: 0 }

  aggregatePurchases(views, draft.equipment?.purchases ?? [], purchaseSource)

  return [...views.values()]
}

export function formatInventorySourceSummary(
  sources: readonly EquipmentSourceAllocation[],
): string {
  const parts: string[] = []

  for (const source of sources) {
    if (source.kind === 'startingWealthTier') {
      parts.push(`${source.quantity} grant choice`)
      continue
    }
    if (source.kind === 'startingGold') {
      parts.push(`${source.quantity} purchased`)
      continue
    }
    if (source.kind === 'classStartingEquipment') {
      parts.push(`${source.quantity} included`)
    }
  }

  return parts.join(' · ')
}
