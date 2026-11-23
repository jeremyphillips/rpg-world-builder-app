import type { MasterDetailRowTitleConfig } from '../../lib/master-detail/master-detail-row-title'
import type { TraitRowForm } from './species-trait-form-fields'
import { resolveFacing } from '../../facing/resolve-facing'

function resolveSpeciesTraitDerivedTitle(row: TraitRowForm, index: number): string {
  if (!row.kind || row.kind === 'custom') return ''
  const id = row.id ?? `draft-${index}`
  try {
    const resolution = resolveFacing({
      domain: 'trait',
      source: 'draft',
      hostId: 'species-traits',
      row: { ...row, id },
    })
    if (resolution.status === 'ready') return resolution.document.title
    return ''
  } catch {
    return ''
  }
}

/** Inline title policy for species traits and heritage options. */
export function createSpeciesTraitRowTitleConfig(): MasterDetailRowTitleConfig<TraitRowForm> {
  return {
    resolveRowTitle: (ctx) => {
      const kind = ctx.row?.kind
      if (!kind || kind === 'custom') {
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
