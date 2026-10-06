import { createElement } from 'react'
import { describe, expect, it } from 'vitest'

import {
  isEntityAnatomyUtilityTrailing,
  resolveEntityAnatomyTrailingCells,
} from './entity-anatomy-trailing.lib'
import type { EntityAnatomyTrailing } from './entity-anatomy-trailing.types'

const content = createElement('button', { type: 'button' })

const CASES: ReadonlyArray<[string, EntityAnatomyTrailing, string, string | undefined, boolean]> = [
  ['action', { kind: 'action', content }, 'band', undefined, false],
  ['utility', { kind: 'utility', content }, 'full', undefined, true],
  ['chevron', { kind: 'indicator', variant: 'chevron' }, 'full', undefined, true],
  ['quantity', { kind: 'indicator', variant: 'quantity', quantity: 2 }, 'band', undefined, false],
  [
    'quantity + meta',
    { kind: 'indicator', variant: 'quantity', quantity: 2, meta: '2 Common choices' },
    'band',
    undefined,
    false,
  ],
  [
    'label',
    { kind: 'indicator', variant: 'label', label: '50 GP value' },
    'band',
    undefined,
    false,
  ],
  ['action + meta', { kind: 'action', content, meta: '1 Common choice' }, 'band', undefined, false],
  [
    'utility + meta',
    { kind: 'utility', content, meta: 'Purchased · 5 GP' },
    'full',
    undefined,
    true,
  ],
  ['group', { kind: 'group', primary: content }, 'band', undefined, false],
  [
    'group + secondary',
    { kind: 'group', primary: content, secondary: { kind: 'price', label: '5 GP' } },
    'band',
    'meta',
    false,
  ],
]

describe('resolveEntityAnatomyTrailingCells', () => {
  it.each(CASES)('%s → primary %s', (_label, trailing, primary, secondary, utilityEdge) => {
    const cells = resolveEntityAnatomyTrailingCells(trailing)

    expect(cells.primary).toEqual({ slot: primary, column: 'trailing' })
    expect(cells.secondary?.slot).toBe(secondary)
    expect(isEntityAnatomyUtilityTrailing(trailing)).toBe(utilityEdge)
  })
})
