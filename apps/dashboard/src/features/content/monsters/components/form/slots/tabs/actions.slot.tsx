import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { MonsterActionSections } from '../../monster-action-sections'

export function ActionsSlot({ ctx }: { ctx: ContentFormCtx }) {
  return <MonsterActionSections ctx={ctx} />
}
