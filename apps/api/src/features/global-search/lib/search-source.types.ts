import type { GlobalSearchDocument } from '@rpg/contracts'

import type { SearchCollectContext } from './search-collect-context'

export type SearchSource = {
  id: string
  collect(ctx: SearchCollectContext): Promise<GlobalSearchDocument[]>
}
