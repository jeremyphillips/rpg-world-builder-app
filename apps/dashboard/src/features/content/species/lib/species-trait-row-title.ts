import { resolveTraitDisplay } from '@rpg/contracts'

import type { MasterDetailRowTitleConfig } from '../../lib/master-detail/master-detail-row-title'
import type { TraitRowForm } from './species-trait-form-fields'
import { traitFromFormRow } from './species-trait-form-values'

function resolveSpeciesTraitDerivedTitle(row: TraitRowForm, index: number): string {
  const kind = row.kind ?? 'custom'
  if (kind === 'custom') return ''
  const id = row.id ?? `draft-${index}`
  try {
    return resolveTraitDisplay(traitFromFormRow({ ...row, id })).name
  } catch {
    return ''
  }
}

/** Inline title policy for species traits and heritage options. */
export function createSpeciesTraitRowTitleConfig(): MasterDetailRowTitleConfig<TraitRowForm> {
  return {
    resolveRowTitle: (ctx) => {
      const kind = ctx.row?.kind ?? 'custom'
      if (kind === 'custom') {
        return { strategy: 'authored', field: 'name' }
      }
      return {
        strategy: 'override',
        field: 'nameOverride',
        resolveDerived: () => resolveSpeciesTraitDerivedTitle(ctx.row, ctx.index),
      }
    },
  }
}

/** Heritage options are always custom traits with an authored name. */
export const HERITAGE_OPTION_ROW_TITLE: MasterDetailRowTitleConfig<TraitRowForm> = {
  strategy: 'authored',
  field: 'name',
}
