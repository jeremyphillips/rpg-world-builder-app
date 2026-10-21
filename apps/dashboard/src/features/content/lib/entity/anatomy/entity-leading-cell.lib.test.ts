import { createElement } from 'react'
import { describe, expect, it } from 'vitest'

import { resolveEntityLeadingCell } from './entity-leading-cell.lib'
import type { EntityAnatomyLeading } from './entity-anatomy-leading.types'

const content = createElement('button', { type: 'button' })

const CASES: ReadonlyArray<[string, EntityAnatomyLeading, 'band' | 'full']> = [
  ['title', { kind: 'title', content }, 'band'],
  ['selection', { kind: 'selection', content }, 'full'],
]

describe('resolveEntityLeadingCell', () => {
  it.each(CASES)('%s → %s', (_label, leading, slot) => {
    expect(resolveEntityLeadingCell(leading)).toEqual({ slot, column: 'leading' })
  })
})
