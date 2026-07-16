import { createElement } from 'react'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/content-form-registry'
import { SpellResolutionEmptyState } from '../../components/editor/spell-resolution-empty-state.client'
import { configuredResolutionFields } from './resolution-form-slots'
import { RESOLUTION_SECTION_LABELS } from './resolution-form-labels'
import { visibleWhenNoResolution } from './resolution-form-visibility'

/** Resolution tab fields for the spell authoring form. */
export function resolutionFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'slot',
      name: '_resolutionPersistenceNotice',
      render: () =>
        createElement(
          'p',
          { className: 'text-sm text-muted-foreground', role: 'status' },
          RESOLUTION_SECTION_LABELS.notSavedBanner,
        ),
    },
    {
      kind: 'slot',
      name: '_resolutionEmptyState',
      visibility: visibleWhenNoResolution(),
      render: () => createElement(SpellResolutionEmptyState),
    },
    ...configuredResolutionFields(ctx),
  ]
}
