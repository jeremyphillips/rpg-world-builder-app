import { useMemo } from 'react'

import type { ContentFormCtx } from '../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../monsters/lib/actions/monster-action-presets'
import type { MonsterActionSection } from '../monsters/lib/actions/references/monster-action-equipment-references'
import type { MonsterFormValues } from '../monsters/lib/monster-form-values'
import { resolveMonsterActionDraftFacing } from './domains/monster-action/resolve-monster-action-draft-facing'
import type { FacingHostConfig } from './facing-host-config.types'
import { toFacingPanelModel } from './structured-facing-host-panel'

export function useMonsterActionFacingHost(input: {
  ctx: ContentFormCtx
  values: MonsterFormValues | undefined
  action: MonsterActionDraftRow | undefined
  section: MonsterActionSection | undefined
}): FacingHostConfig | undefined {
  const { ctx, values, action, section } = input

  return useMemo((): FacingHostConfig | undefined => {
    if (!values || !action || !section || !action.id) return undefined

    const actionId = action.id

    return {
      hostId: 'monster-action-sections',
      resolvePanelModel: () => {
        const result = resolveMonsterActionDraftFacing({
          values,
          ctx,
          actionId,
          section,
        })
        return toFacingPanelModel(result.resolution, result.previewSupport)
      },
    }
  }, [action, ctx, section, values])
}
