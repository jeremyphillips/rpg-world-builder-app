import { describe, expect, it } from 'vitest'

import type { GlobalSearchDocument } from '@rpg/contracts'

import {
  deriveGlobalSearchPreviewGroupFollows,
  deriveGlobalSearchPreviewGroupState,
} from './global-search-preview-group'
import type { GlobalSearchGroupSection } from './rank-global-search'

function section(overrides: Partial<GlobalSearchGroupSection>): GlobalSearchGroupSection {
  return {
    filterGroup: 'content',
    items: [{ id: '1' } as GlobalSearchDocument],
    totalCount: 1,
    ...overrides,
  }
}

describe('global search preview group helpers', () => {
  it('derives truncated when preview items are fewer than total matches', () => {
    expect(
      deriveGlobalSearchPreviewGroupState(
        section({ items: [{ id: '1' } as GlobalSearchDocument], totalCount: 14 }),
      ),
    ).toBe('truncated')
  })

  it('derives complete when all matches fit in the preview slice', () => {
    expect(
      deriveGlobalSearchPreviewGroupState(
        section({
          items: [{ id: '1' } as GlobalSearchDocument, { id: '2' } as GlobalSearchDocument],
          totalCount: 2,
        }),
      ),
    ).toBe('complete')
  })

  it('derives heading follow state from the previous section', () => {
    const sections = [
      section({
        filterGroup: 'content',
        totalCount: 14,
        items: [{ id: '1' } as GlobalSearchDocument],
      }),
      section({
        filterGroup: 'characters',
        totalCount: 2,
        items: [{ id: '2' } as GlobalSearchDocument, { id: '3' } as GlobalSearchDocument],
      }),
      section({
        filterGroup: 'game-terms',
        totalCount: 5,
        items: [{ id: '4' } as GlobalSearchDocument],
      }),
    ]

    expect(deriveGlobalSearchPreviewGroupFollows(sections, 0)).toBe('none')
    expect(deriveGlobalSearchPreviewGroupFollows(sections, 1)).toBe('truncated')
    expect(deriveGlobalSearchPreviewGroupFollows(sections, 2)).toBe('complete')
  })
})
