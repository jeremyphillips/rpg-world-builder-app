import type { ContentFormCtx } from '../lib/forms/registry/content-form-registry'
import type { MonsterActionDraftRow } from '../monsters/lib/actions/monster-action-presets'
import type { MonsterActionSection } from '../monsters/lib/actions/references/monster-action-equipment-references'
import type { MonsterFormValues } from '../monsters/lib/monster-form-values'
import type { FacingHostConfig } from './facing-host-config.types'

export function useMonsterActionFacingHost(input: {
  ctx: ContentFormCtx
  values: MonsterFormValues | undefined
  action: MonsterActionDraftRow | undefined
  section: MonsterActionSection | undefined
}): FacingHostConfig | undefined {
  const { ctx, values, action, section } = input

  if (!values || !action?.id || !section) return undefined

  return {
    domain: 'monsterAction',
    source: 'draft',
    values,
    ctx,
    section,
    actionId: action.id,
  }
}
