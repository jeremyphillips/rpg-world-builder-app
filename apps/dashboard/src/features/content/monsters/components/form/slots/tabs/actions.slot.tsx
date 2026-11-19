import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { MonsterActionSections } from '../../actions/action-sections'

export function ActionsSlot({ ctx }: { ctx: ContentFormCtx }) {
  return <MonsterActionSections ctx={ctx} />
}
