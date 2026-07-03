import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { ButtonDropdown } from './button-dropdown.client'

const groups = [
  { id: 'proficiencies', label: 'Proficiencies & training' },
  { id: 'combat-traits', label: 'Combat & traits' },
]

const items = [
  {
    id: 'skill-proficiency',
    label: 'Skill proficiency',
    description: 'Grant proficiency with specific skills or a pool.',
    groupId: 'proficiencies',
  },
  {
    id: 'movement-bonus',
    label: 'Movement bonus',
    description: 'Increase a movement mode speed.',
    groupId: 'combat-traits',
    searchTerms: [{ text: 'walking speed', weight: 1, role: 'keyword' as const }],
  },
  {
    id: 'language',
    label: 'Language',
    description: 'Grant knowledge of a language.',
    groupId: 'proficiencies',
    disabled: true,
    note: 'Already added',
  },
]

describe('ButtonDropdown', () => {
  it('renders grouped sections when closed and opens a searchable menu', async () => {
    const user = userEvent.setup()
    render(
      <ButtonDropdown label="Add grant" groups={groups} items={items} onSelectItem={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Add grant' }))
    expect(screen.getByText('Proficiencies & training')).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search Add grant' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Skill proficiency/i })).toBeInTheDocument()
    expect(screen.getByText('Already added')).toBeInTheDocument()
  })

  it('selects an item and closes the panel', async () => {
    const user = userEvent.setup()
    const onSelectItem = vi.fn()
    render(
      <ButtonDropdown
        label="Add grant"
        groups={groups}
        items={items}
        onSelectItem={onSelectItem}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add grant' }))
    await user.click(screen.getByRole('option', { name: /Movement bonus/i }))
    expect(onSelectItem).toHaveBeenCalledWith('movement-bonus')
    expect(screen.queryByRole('searchbox', { name: 'Search Add grant' })).not.toBeInTheDocument()
  })

  it('filters to a ranked flat list while searching', async () => {
    const user = userEvent.setup()
    render(
      <ButtonDropdown label="Add grant" groups={groups} items={items} onSelectItem={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'Add grant' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search Add grant' }), 'walking')

    expect(screen.getByRole('option', { name: /Movement bonus/i })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Skill proficiency/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Proficiencies & training')).not.toBeInTheDocument()
  })

  it('supports keyboard selection from the search field', async () => {
    const user = userEvent.setup()
    const onSelectItem = vi.fn()
    render(
      <ButtonDropdown
        label="Add grant"
        groups={groups}
        items={items}
        onSelectItem={onSelectItem}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add grant' }))
    const search = screen.getByRole('searchbox', { name: 'Search Add grant' })
    await user.type(search, 'skill')
    await user.keyboard('{Enter}')
    expect(onSelectItem).toHaveBeenCalledWith('skill-proficiency')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <ButtonDropdown label="Add grant" groups={groups} items={items} onSelectItem={vi.fn()} />,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
