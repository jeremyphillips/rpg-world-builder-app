import type { Equipment, SystemRulesetId } from '@rpg/contracts'

import type { ContentOverlayFailureOverviewRow } from '../../lib/list/create-content-list'
import { isContentOverlayFailureOverviewRow } from '../../lib/list/content-overlay-overview.lib'
import { resolveCatalogSeedBody } from '../../lib/forms/registry/resolve-catalog-seed-body.lib'
import type { EquipmentFamilyPath } from './shared/equipment-family-paths'
import { familyPathToEquipmentKind } from './shared/equipment-family-paths'

export type EquipmentFamilyRulesetGate = {
  rulesetId: SystemRulesetId | undefined
  isPending: boolean
  isError: boolean
}

export type EquipmentFamilyOverviewRow =
  | (Equipment & { kind: Equipment['kind'] })
  | ContentOverlayFailureOverviewRow

export function equipmentFamilyOverviewHasOverlayFailures(rows: readonly unknown[]): boolean {
  return rows.some(isContentOverlayFailureOverviewRow)
}

/**
 * When overlay failures are present, family membership for unresolved rows requires campaign
 * ruleset context — never guess kind while ruleset is loading. On ruleset lookup failure, omit
 * unclassified failures from the family table; surface them via
 * {@link equipmentFamilyUnclassifiedOverlayFailures} (list/column errors remain full-page errors).
 */
export function filterEquipmentFamilyOverviewRows<T extends { kind: Equipment['kind'] }>(
  rows: readonly (T | ContentOverlayFailureOverviewRow)[],
  family: EquipmentFamilyPath,
  ruleset: EquipmentFamilyRulesetGate,
): Array<T | ContentOverlayFailureOverviewRow> {
  const kind = familyPathToEquipmentKind(family)
  if (!kind) {
    return [...rows]
  }

  const hasOverlayFailures = equipmentFamilyOverviewHasOverlayFailures(rows)
  if (ruleset.isPending && hasOverlayFailures) {
    return []
  }

  return rows.filter((item) => {
    if (isContentOverlayFailureOverviewRow(item)) {
      if (ruleset.isError || !ruleset.rulesetId) {
        return false
      }
      const seed = resolveCatalogSeedBody('equipment', ruleset.rulesetId, item.id)
      return seed?.kind === kind
    }
    return item.kind === kind
  })
}

/** Overlay failures that cannot be family-classified while ruleset context is missing. */
export function equipmentFamilyUnclassifiedOverlayFailures(
  rows: readonly unknown[],
  ruleset: EquipmentFamilyRulesetGate,
): ContentOverlayFailureOverviewRow[] {
  if (!ruleset.isError) return []
  return rows.filter(isContentOverlayFailureOverviewRow)
}

/** True when the family table must stay in loading until ruleset can classify overlay failures. */
export function equipmentFamilyOverviewAwaitingRulesetForFailures(
  rows: readonly unknown[],
  ruleset: EquipmentFamilyRulesetGate,
): boolean {
  return ruleset.isPending && equipmentFamilyOverviewHasOverlayFailures(rows)
}
