import type { CatalogOverlayListFailure, SystemRulesetId } from '@rpg/contracts'

import { resolveSubclassCatalogSeedBody } from '../../../lib/forms/registry/resolve-catalog-seed-body.lib'

/** Client safeguard: only failures whose seed parent matches the tab class. */
export function filterSubclassOverlayFailuresForClass(
  failures: readonly CatalogOverlayListFailure[],
  classId: string,
  rulesetId: SystemRulesetId | undefined,
): CatalogOverlayListFailure[] {
  if (!failures.length) return []
  if (!rulesetId) return [...failures]

  return failures.filter((failure) => {
    const seed = resolveSubclassCatalogSeedBody(rulesetId, failure.targetId)
    if (!seed) return false
    const seedClassId = seed.classId
    return typeof seedClassId === 'string' && seedClassId === classId
  })
}

export function resolveSubclassOverlayFailureClassId(
  failure: CatalogOverlayListFailure,
  routeClassId: string,
  rulesetId: SystemRulesetId | undefined,
): string {
  if (!rulesetId) return routeClassId
  const seed = resolveSubclassCatalogSeedBody(rulesetId, failure.targetId)
  const seedClassId = seed?.classId
  return typeof seedClassId === 'string' ? seedClassId : routeClassId
}
