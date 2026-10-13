import type { z } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'

import type { EquipmentInstance } from './instance'

export function refineEquipmentInstanceInvariants(
  entry: EquipmentInstance,
  ctx: z.RefinementCtx,
  pathPrefix: (string | number)[] = [],
): void {
  const magicProperties = entry.magicProperties ?? []
  const adjustments = entry.adjustments ?? []

  if (magicProperties.length > 0 && !entry.magical) {
    addCustomRefinementIssue(ctx, 'Magic properties require the magical flag.', [
      ...pathPrefix,
      'magicProperties',
    ])
  }

  const presetIds = magicProperties
    .filter((row) => row.kind === 'preset')
    .map((row) => row.propertyId)
  if (new Set(presetIds).size !== presetIds.length) {
    addCustomRefinementIssue(ctx, 'Duplicate preset magic property ids.', [
      ...pathPrefix,
      'magicProperties',
    ])
  }

  const customIds = magicProperties
    .filter((row) => row.kind === 'custom')
    .map((row) => row.customId)
  if (new Set(customIds).size !== customIds.length) {
    addCustomRefinementIssue(ctx, 'Duplicate custom magic property ids.', [
      ...pathPrefix,
      'magicProperties',
    ])
  }

  const effectIds = adjustments.map((row) => row.effectId)
  if (new Set(effectIds).size !== effectIds.length) {
    addCustomRefinementIssue(ctx, 'Duplicate adjustment ids.', [...pathPrefix, 'adjustments'])
  }

  const targets = adjustments.map((row) => row.target)
  if (new Set(targets).size !== targets.length) {
    addCustomRefinementIssue(ctx, 'At most one adjustment per target.', [
      ...pathPrefix,
      'adjustments',
    ])
  }

  if (entry.modifiers?.some((modifier) => modifier.kind === 'armor_class')) {
    addCustomRefinementIssue(
      ctx,
      'Use adjustments for Armor Class bonuses instead of armor_class modifiers.',
      [...pathPrefix, 'modifiers'],
    )
  }
}
