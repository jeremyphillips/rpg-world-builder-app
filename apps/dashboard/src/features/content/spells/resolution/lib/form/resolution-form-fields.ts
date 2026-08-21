import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import { SpellResolutionEmptyState } from '../../components/editor/spell-resolution-empty-state.client'
import { configuredResolutionFields } from './resolution-form-slots'
import { visibleWhenNoResolution } from './resolution-form-visibility'

/** Resolution tab fields for the spell authoring form. */
export function resolutionFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'slot',
      name: '_resolutionEmptyState',
      visibility: visibleWhenNoResolution(),
      render: () => createElement(SpellResolutionEmptyState),
    },
    ...configuredResolutionFields(ctx),
  ]
}
