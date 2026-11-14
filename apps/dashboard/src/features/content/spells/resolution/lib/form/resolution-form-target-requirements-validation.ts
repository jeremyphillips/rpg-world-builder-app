import type { z } from 'zod'

import {
  addCustomRefinementIssue,
  type ResolutionTargetKind,
  refineRequirementRowsForTargetKind,
} from '@rpg/contracts'

import { reconcileResolutionTargetRequirementRow } from '../../../../lib/forms/fields/resolution-target-requirement-form-sync.lib'

import type { ResolutionFormValues } from './resolution-form-schema'

function reconcileRow(row: unknown): unknown {
  return reconcileResolutionTargetRequirementRow(row) ?? row
}

function validateRequirementPaths(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
  paths: readonly {
    key: 'target' | 'occupantRequirements'
    targetKind: ResolutionTargetKind | undefined
  }[],
): void {
  for (const { key, targetKind } of paths) {
    const rows = key === 'target' ? values.target?.requirements : values.occupantRequirements
    if (!Array.isArray(rows) || rows.length === 0) continue

    const pathPrefix =
      key === 'target' ? (['target', 'requirements'] as const) : (['occupantRequirements'] as const)

    refineRequirementRowsForTargetKind(targetKind, rows.map(reconcileRow), (index, message) => {
      addCustomRefinementIssue(ctx, message, [...pathPrefix, index])
    })
  }
}

export function validateResolutionFormTargetRequirements(
  values: ResolutionFormValues,
  ctx: z.RefinementCtx,
): void {
  if (values.selectionMode === 'targets' && values.target) {
    validateRequirementPaths(values, ctx, [
      { key: 'target', targetKind: values.target.kind as ResolutionTargetKind | undefined },
    ])
  }

  validateRequirementPaths(values, ctx, [{ key: 'occupantRequirements', targetKind: 'creature' }])
}
