import { resolveTraitName, type ContentTrait } from '@rpg/contracts'

import type { MasterDetailRowTitleConfig } from '../../lib/master-detail/master-detail-row-title'
import { type TraitRowForm } from './species-trait-form-schema'
import { traitItemTitle } from './species-trait-form-fields'

/** Inline title policy for species traits and heritage options. */
export function createSpeciesTraitRowTitleConfig(): MasterDetailRowTitleConfig<TraitRowForm> {
  return {
    resolveRowTitle: (ctx) => {
      const kind = ctx.row?.kind
      if (!kind || kind === 'custom') {
        return { strategy: 'authored', field: 'name' }
      }
      if (kind === 'template' && ctx.row.templateId) {
        return {
          strategy: 'readonly',
          resolveTitle: () =>
            resolveTraitName({
              kind: 'template',
              id: ctx.row.id ?? `trait-${ctx.index}`,
              templateId: ctx.row.templateId,
              config: ctx.row.config,
            } as ContentTrait),
        }
      }
      return {
        strategy: 'override',
        field: 'nameOverride',
        resolveDerived: () => traitItemTitle(ctx.row, ctx.index),
      }
    },
  }
}

/** Heritage options are always custom traits with an authored name. */
export const HERITAGE_OPTION_ROW_TITLE: MasterDetailRowTitleConfig<TraitRowForm> = {
  strategy: 'authored',
  field: 'name',
}
