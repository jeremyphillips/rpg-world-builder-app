import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { MonsterTraitsEditor } from '../../traits/traits-editor'

export function TraitsSlot({ ctx }: { ctx: ContentFormCtx }) {
  return <MonsterTraitsEditor ctx={ctx} />
}
