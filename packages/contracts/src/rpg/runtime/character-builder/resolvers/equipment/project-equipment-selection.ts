import type { CharacterSelectionSource } from '../../../character/sheet/selection-sources'
import {
  formatStandardSelectionSourceLabel,
  type SelectionSourceLabelCatalogIndex,
} from '../../../character/format-selection-source-label'
import { getNpcTemplateLabel } from '../../../../vocab/npc/npc-template'
import type { EquipmentSupplySource } from '../../recommendation/recommendation-envelope'
import type { EquipmentAdditionPolicy } from './resolve-equipment-addition-policy'
import type { ResolvedEquipmentOption } from './project-equipment-option-facts'

const EMPTY_SUPPLY_CATALOG: SelectionSourceLabelCatalogIndex = { classes: new Map() }

/** Maps a persisted selection source onto row supply semantics. */
export function adaptCharacterSelectionToEquipmentSupply(
  source: CharacterSelectionSource,
): EquipmentSupplySource {
  if (source.kind === 'npcTemplate') {
    const id = source.sourceId ?? 'role'
    return source.grantId === 'role-default' ? { kind: 'role-default', id } : { kind: 'role', id }
  }
  if (source.kind === 'manual') return { kind: 'manual' }
  return { kind: 'recorded', source }
}

function supplySourceKey(source: EquipmentSupplySource): string {
  switch (source.kind) {
    case 'manual':
      return 'manual'
    case 'role':
    case 'role-default':
      return `${source.kind}:${source.id}`
    case 'recorded':
      return `recorded:${source.source.kind}:${source.source.sourceId ?? ''}:${source.source.grantId ?? ''}`
    default: {
      const _exhaustive: never = source
      return _exhaustive
    }
  }
}

export function dedupeEquipmentSupplySources(
  sources: readonly EquipmentSupplySource[],
): EquipmentSupplySource[] {
  const seen = new Set<string>()
  const deduped: EquipmentSupplySource[] = []
  for (const source of sources) {
    const key = supplySourceKey(source)
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(source)
  }
  return deduped
}

/** Canonical supply phrase. Recommendation copy stays on recommendation source labels. */
export function formatEquipmentSupplySourceLabel(
  source: EquipmentSupplySource,
  catalogIndex: SelectionSourceLabelCatalogIndex = EMPTY_SUPPLY_CATALOG,
): string {
  if (source.kind === 'manual') return 'Added manually'
  if (source.kind === 'role' || source.kind === 'role-default') {
    return `${getNpcTemplateLabel(source.id)} role`
  }
  return formatStandardSelectionSourceLabel([source.source], catalogIndex)
}

export function formatEquipmentSupplySourceLabels(
  sources: readonly EquipmentSupplySource[],
  catalogIndex?: SelectionSourceLabelCatalogIndex,
): string {
  return dedupeEquipmentSupplySources(sources)
    .map((source) => formatEquipmentSupplySourceLabel(source, catalogIndex))
    .join(' · ')
}

export type EquipmentAdditionMode = EquipmentAdditionPolicy

/**
 * Another copy may be added only when the addition constraint allows it.
 * Ownership does not forbid the action by itself: a singleton may take its
 * first copy, and a blocked row stays closed at quantity 0.
 */
export function canAddAnotherEquipmentCopy(
  quantity: number,
  addition: EquipmentAdditionMode,
): boolean {
  if (addition === 'blocked') return false
  if (addition === 'single') return quantity <= 0
  return true
}

/**
 * Merges live quantity and supply into a resolved option.
 * Requirement roles and recommendation strength are copied through unchanged.
 */
export function projectEquipmentSelection(args: {
  resolved: ResolvedEquipmentOption
  quantity: number
  sources: readonly EquipmentSupplySource[]
  addition: EquipmentAdditionMode
  removable?: boolean
}): ResolvedEquipmentOption {
  const quantity = Math.max(0, Math.floor(args.quantity))
  const sources = dedupeEquipmentSupplySources(args.sources)
  const canAddMore = canAddAnotherEquipmentCopy(quantity, args.addition)
  return {
    requirements: args.resolved.requirements,
    recommendation: args.resolved.recommendation,
    ...(args.resolved.presentation ? { presentation: args.resolved.presentation } : {}),
    ...(args.resolved.purchaseAvailability
      ? { purchaseAvailability: args.resolved.purchaseAvailability }
      : {}),
    state: {
      ...args.resolved.state,
      selection: {
        selected: quantity > 0,
        quantity,
        canAddMore,
        removable: args.removable ?? quantity > 0,
        sources,
      },
    },
  }
}
