import { describe, expectTypeOf, it } from 'vitest'

import type { EntitySummaryModel } from './entity-summary.types'
import type { EntitySummaryStatusItem } from './entity-summary-status.types'

describe('entity summary status closed API', () => {
  it('EntitySummaryModel.status accepts structured status items only', () => {
    const status = [
      { kind: 'badge', label: 'Member', tone: 'success' },
      { kind: 'text', label: 'Concentration', variant: 'muted' },
    ] as const satisfies readonly EntitySummaryStatusItem[]

    expectTypeOf(status).toMatchTypeOf<readonly EntitySummaryStatusItem[]>()
  })

  it('rejects plain string status entries at compile time', () => {
    expectTypeOf<EntitySummaryModel['status']>().not.toEqualTypeOf<readonly string[]>()
  })
})
