import type {
  CatalogMembershipFilterInput,
  CatalogPlayFilterInput,
} from './filter-catalog-for-viewer'
import { filterCatalogForMembership, filterCatalogForPlayActor } from './filter-catalog-for-viewer'

export type CatalogListFilter =
  | { mode: 'discovery'; membership: CatalogMembershipFilterInput | undefined }
  | {
      mode: 'play'
      membership: CatalogMembershipFilterInput
      playActor: CatalogPlayFilterInput['playActor']
    }

type CatalogListRow = Parameters<typeof filterCatalogForMembership>[0][number]

export function applyCatalogListFilter<T extends CatalogListRow>(
  items: T[],
  filter: CatalogListFilter | undefined,
): T[] {
  if (!filter) {
    return filterCatalogForMembership(items, undefined)
  }

  if (filter.mode === 'play') {
    return filterCatalogForPlayActor(items, {
      campaignRole: filter.membership.campaignRole,
      playActor: filter.playActor,
    })
  }

  return filterCatalogForMembership(items, filter.membership)
}
