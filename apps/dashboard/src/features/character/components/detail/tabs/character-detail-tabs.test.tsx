import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import {
  CHARACTER_DETAIL_TAB_LABELS,
  CHARACTER_EMPTY_SECTION_TEXT,
} from '../../../lib/display/character-display'
import { CharacterDetailTabs } from './character-detail-tabs'

const emptySection = {
  title: 'Section',
  items: [],
  emptyText: 'Empty',
}

describe('CharacterDetailTabs', () => {
  it('insets short and longer tab panels', async () => {
    const user = userEvent.setup()
    render(
      <CharacterDetailTabs
        spells={[]}
        equipment={[]}
        wealth={{ label: 'Wealth', value: '0 gp' }}
        classFeatures={{
          ...emptySection,
          items: [{ id: 'rage', label: 'Rage', detail: 'Bonus damage' }],
        }}
        speciesTraits={emptySection}
        feats={emptySection}
        connections={emptySection}
        narrative={undefined}
      />,
    )

    expect(screen.getByText(CHARACTER_EMPTY_SECTION_TEXT.spells).closest('.ui-panel')).toHaveClass(
      'ui-panel--transparent',
      'ui-panel--comfortable',
    )

    await user.click(
      screen.getByRole('tab', { name: CHARACTER_DETAIL_TAB_LABELS.featuresAndTraits }),
    )
    expect(screen.getByText('Rage').closest('li')).toHaveClass('rounded-md')

    await user.click(screen.getByRole('tab', { name: CHARACTER_DETAIL_TAB_LABELS.narrative }))
    expect(
      screen.getByText(CHARACTER_EMPTY_SECTION_TEXT.narrative).closest('.ui-panel'),
    ).toHaveClass('ui-panel--transparent', 'ui-panel--comfortable')
  })
})
