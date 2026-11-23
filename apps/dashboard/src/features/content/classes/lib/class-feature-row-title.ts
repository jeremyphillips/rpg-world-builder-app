import { subclassChoiceFeatureLabel } from '@rpg/contracts'

import type { MasterDetailRowTitleConfig } from '../../lib/master-detail/master-detail-row-title'
import type { FeatureRowForm } from './class-feature-form-fields'

/** Inline title policy for class features in the master-detail shell. */
export function createClassFeatureRowTitleConfig(
  className: string,
): MasterDetailRowTitleConfig<FeatureRowForm> {
  return {
    resolveRowTitle: (ctx) => {
      if (ctx.row?.kind === 'subclass-choice') {
        return {
          strategy: 'override',
          field: 'name',
          resolveDerived: () => subclassChoiceFeatureLabel(className),
        }
      }
      return { strategy: 'authored', field: 'name' }
    },
  }
}
