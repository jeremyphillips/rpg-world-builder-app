import {
  formatEquipmentSupplySourceLabel,
  type EquipmentSupplySource,
  type SelectionSourceLabelCatalogIndex,
} from '@rpg/contracts'

import type { EquipmentOptionSupplyClause } from '@/features/character/lib/equipment/equipment-option-row-presentation.lib'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

type EquipmentSupplyContribution = {
  source: EquipmentSupplySource
  quantity: number
}

/** How many automatic origins the Additional Equipment context line names. */
const ADDITIONAL_EQUIPMENT_INLINE_SOURCE_LIMIT = 1

function isClassPackageSource(source: EquipmentSupplySource): boolean {
  return source.kind === 'recorded' && source.source.kind === 'classStartingEquipment'
}

function classPackageLabel(
  source: Extract<EquipmentSupplySource, { kind: 'recorded' }>,
  quantity: number,
  catalog: SelectionSourceLabelCatalogIndex,
): string {
  const classId = source.source.sourceId
  const className = classId ? catalog.classes.get(classId)?.name : undefined
  return `${className ?? 'Class'} package ×${quantity}`
}

function contributionLabel(
  contribution: EquipmentSupplyContribution,
  catalog: SelectionSourceLabelCatalogIndex,
): string {
  const { source, quantity } = contribution
  if (source.kind === 'recorded' && source.source.kind === 'classStartingEquipment') {
    return classPackageLabel(source, quantity, catalog)
  }
  return `${formatEquipmentSupplySourceLabel(source, catalog)} ×${quantity}`
}

function contributionClause(
  contribution: EquipmentSupplyContribution,
  catalog: SelectionSourceLabelCatalogIndex,
): EquipmentOptionSupplyClause | undefined {
  if (contribution.source.kind === 'manual' || contribution.quantity <= 0) return undefined
  const label = contributionLabel(contribution, catalog)
  if (!label.trim()) return undefined
  return { label, source: contribution.source }
}

function packageFirst(
  clauses: readonly EquipmentOptionSupplyClause[],
): EquipmentOptionSupplyClause[] {
  return [
    ...clauses.filter((clause) => isClassPackageSource(clause.source)),
    ...clauses.filter((clause) => !isClassPackageSource(clause.source)),
  ]
}

/** Automatic origins only. Manual contributions stay off this list. */
export function presentQuickNpcEquipmentSupplyClauses(args: {
  contributions: readonly EquipmentSupplyContribution[]
  catalog: SelectionSourceLabelCatalogIndex
}): EquipmentOptionSupplyClause[] {
  const clauses = args.contributions.flatMap((contribution) => {
    const clause = contributionClause(contribution, args.catalog)
    return clause ? [clause] : []
  })
  return packageFirst(clauses)
}

export function formatManualEquipmentQuantityLabel(quantity: number): string | undefined {
  if (quantity <= 0) return undefined
  return `+${quantity}`
}

export function formatManualEquipmentQuantityAccessibleLabel(quantity: number): string {
  return `Manual quantity ${quantity}`
}

function otherSourcesLabel(count: number): string {
  return count === 1 ? '+1 other source' : `+${count} other sources`
}

/**
 * Explains quantity that did not come from the manual add.
 * Omitted when the manual contribution already accounts for the resolved total.
 */
export function formatQuickNpcAdditionalEquipmentContext(args: {
  totalQuantity: number
  manualQuantity: number
  supplyClauses: readonly EquipmentOptionSupplyClause[]
}): string | undefined {
  if (args.manualQuantity >= args.totalQuantity) return undefined
  const ordered = packageFirst(args.supplyClauses)
  const shown = ordered.slice(0, ADDITIONAL_EQUIPMENT_INLINE_SOURCE_LIMIT)
  const hidden = ordered.length - shown.length
  const parts = [`${args.totalQuantity} total`, ...shown.map((clause) => clause.label)]
  if (hidden > 0) parts.push(otherSourcesLabel(hidden))
  return joinInlineMetadata(parts)
}
