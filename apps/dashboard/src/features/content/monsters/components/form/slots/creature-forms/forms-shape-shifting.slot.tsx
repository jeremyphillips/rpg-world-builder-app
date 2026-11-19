import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { MonsterFormsLifecycleProvider } from '../../../../hooks/monster-forms-lifecycle-provider'

import { MonsterFormsDifferencePresentation } from '../../creature-forms/difference-presentation'
import { MonsterFormsEditor } from '../../creature-forms/forms-editor'
import { MonsterTrueFormDesignation } from '../../creature-forms/true-form-designation'

export function MonsterFormsShapeShiftingSection({ ctx }: { ctx: ContentFormCtx }) {
  return (
    <MonsterFormsLifecycleProvider>
      <MonsterTrueFormDesignation />
      <MonsterFormsEditor ctx={ctx} />
      <MonsterFormsDifferencePresentation />
    </MonsterFormsLifecycleProvider>
  )
}
