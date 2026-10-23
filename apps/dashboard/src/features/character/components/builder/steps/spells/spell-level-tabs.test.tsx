import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SpellLevelTabs } from './spell-level-tabs'

describe('SpellLevelTabs', () => {
  it('renders a tablist with tile triggers for multiple levels', () => {
    render(
      <SpellLevelTabs
        tabs={[
          { level: 1, selectedAtLevel: 0, activityLabel: '0 / 2' },
          { level: 2, selectedAtLevel: 1, activityLabel: '1 / 2' },
        ]}
        activeLevel={1}
        onActiveLevelChange={vi.fn()}
      />,
    )

    const tablist = screen.getByRole('tablist', { name: 'Spell levels' })
    expect(tablist).toBeInTheDocument()

    const active = screen.getByRole('tab', { selected: true })
    expect(active).toHaveClass('spell-level-tabs__trigger')
    expect(active).toHaveTextContent('1st')
    expect(active.querySelector('.text-style-caption')).toHaveTextContent('0 / 2')
  })

  it('returns null when only one level is present', () => {
    const { container } = render(
      <SpellLevelTabs
        tabs={[{ level: 1, selectedAtLevel: 0, activityLabel: '0 / 1' }]}
        activeLevel={1}
        onActiveLevelChange={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
