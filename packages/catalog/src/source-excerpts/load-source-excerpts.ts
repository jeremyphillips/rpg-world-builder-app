import type { SourceExcerptRevision } from '@rpg/contracts'

import { parseExcerptStore } from './assert-excerpt-store'
import lockJson from '../../source-excerpts/srd-5.2.1/excerpts.lock.json'
import revisionsJson from '../../source-excerpts/srd-5.2.1/monsters.json'

export async function loadSrdMonsterExcerpts(): Promise<SourceExcerptRevision[]> {
  return parseExcerptStore({
    documentId: 'srd-5.2.1',
    contentTypeKey: 'monsters',
    revisions: revisionsJson,
    lock: lockJson,
  })
}
