import { describe, expectTypeOf, it } from 'vitest'

import type { PickerSelectionStateLineModel } from './picker-selection-state-line.types'
import type { EntitySummaryModel } from './entity-summary.types'
import type {
  EntitySummaryStatusComposition,
  EntitySummaryStatusItem,
} from './entity-summary-status.types'

describe('entity summary status closed API', () => {
  it('EntitySummaryModel.status accepts structured status items only', () => {
    const status = [
      { kind: 'badge', label: 'Member', tone: 'success' },
      { kind: 'text', label: 'Concentration', variant: 'muted' },
    ] as const satisfies readonly EntitySummaryStatusItem[]

    expectTypeOf(status).toMatchTypeOf<readonly EntitySummaryStatusItem[]>()
  })

  it('text items accept the guidance variant and a supplemental title', () => {
    const guidance = {
      kind: 'text',
      label: 'Required by class',
      variant: 'guidance',
      title: 'Wizard class',
    } as const satisfies EntitySummaryStatusItem

    expectTypeOf(guidance).toMatchTypeOf<EntitySummaryStatusItem>()
  })

  it('statusComposition is a closed cluster | metadata choice', () => {
    expectTypeOf<EntitySummaryModel['statusComposition']>().toEqualTypeOf<
      EntitySummaryStatusComposition | undefined
    >()
    expectTypeOf<EntitySummaryStatusComposition>().toEqualTypeOf<'cluster' | 'metadata'>()
  })

  it('stores resolved selection-state copy, not a semantic kind', () => {
    const line = { label: 'Owned', provenance: ['Package'] } as const

    expectTypeOf(line).toMatchTypeOf<PickerSelectionStateLineModel>()
    expectTypeOf<EntitySummaryModel['selectionState']>().toEqualTypeOf<
      PickerSelectionStateLineModel | undefined
    >()
  })

  it('rejects plain string status entries at compile time', () => {
    expectTypeOf<EntitySummaryModel['status']>().not.toEqualTypeOf<readonly string[]>()
  })
})
