import type { CharacterClass, ClassStored } from '@rpg/contracts'

import { parseClassReadModel } from './derive-classes-catalog'
import type { ContentWriteAfterContext, ContentWriteContext } from '../lib/content-write-config'

export async function classBeforeUpdateParse(_ctx: ContentWriteContext): Promise<void> {
  // Class-owned skill choices — no cross-entity sync on update.
}

export async function classAfterWrite(ctx: ContentWriteAfterContext): Promise<CharacterClass> {
  return parseClassReadModel(ctx.entity as ClassStored)
}
