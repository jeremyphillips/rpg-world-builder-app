import { createElement } from 'react'
import { describe, expect, it } from 'vitest'

import {
  isEntityAnatomyUtilityTrailing,
  resolveEntityAnatomyTrailingCells,
} from './entity-anatomy-trailing.lib'
import type { EntityAnatomyTrailing } from './entity-anatomy-trailing.types'

const content = createElement('button', { type: 'button' })

const CASES: ReadonlyArray<[string, EntityAnatomyTrailing, string, boolean]> = [
  ['action', { kind: 'action', content }, 'band', false],
  ['utility', { kind: 'utility', content }, 'full', true],
  ['chevron', { kind: 'indicator', variant: 'chevron' }, 'full', true],
  ['quantity', { kind: 'indicator', variant: 'quantity', quantity: 2 }, 'band', false],
  [
    'quantity + meta',
    { kind: 'indicator', variant: 'quantity', quantity: 2, meta: '2 Common choices' },
    'band',
    false,
  ],
  ['label', { kind: 'indicator', variant: 'label', label: '50 GP value' }, 'band', false],
  ['action + meta', { kind: 'action', content, meta: '1 Common choice' }, 'band', false],
  ['utility + meta', { kind: 'utility', content, meta: 'Purchased · 5 GP' }, 'full', true],
  ['group', { kind: 'group', primary: content }, 'band', false],
  [
    'group + secondary',
    { kind: 'group', primary: content, secondary: { kind: 'price', label: '5 GP' } },
    'band',
    false,
  ],
]

describe('resolveEntityAnatomyTrailingCells', () => {
  it.each(CASES)('%s → primary %s', (_label, trailing, primary, utilityEdge) => {
    const cells = resolveEntityAnatomyTrailingCells(trailing)

    expect(cells.primary).toEqual({ slot: primary, column: 'trailing' })
    expect(isEntityAnatomyUtilityTrailing(trailing)).toBe(utilityEdge)
  })
})
