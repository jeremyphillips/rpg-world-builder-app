import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { buildMasterDetailAvailabilityPresentation } from '../../../lib/master-detail/master-detail-availability.types'
import { SubclassListPanel } from './subclass-list-panel'

describe('SubclassListPanel', () => {
  const items = [
    { id: 'sub_a', name: 'Champion', source: 'system' as const, classId: 'class_fighter' },
    { id: 'sub_b', name: 'Battle Master', source: 'homebrew' as const, classId: 'class_fighter' },
  ]

  const availabilityItems = [
    buildMasterDetailAvailabilityPresentation('sub_a', true),
    buildMasterDetailAvailabilityPresentation('sub_b', false),
  ]

  it('calls onAdd when Add subclass is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(
      <SubclassListPanel
        items={items}
        availabilityItems={availabilityItems}
        selectedId={items[0]?.id ?? null}
        modifiedIds={new Set()}
        onSelect={vi.fn()}
        onAdd={onAdd}
        onDeleteRequest={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Add subclass/i }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('always renders the stable availability count line', () => {
    render(
      <SubclassListPanel
        items={items}
        availabilityItems={availabilityItems}
        selectedId={items[0]?.id ?? null}
        modifiedIds={new Set()}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDeleteRequest={vi.fn()}
      />,
    )

    expect(screen.getByText('1 available · 1 unavailable')).toBeInTheDocument()
  })

  it('hides unavailable rows by default', () => {
    render(
      <SubclassListPanel
        items={items}
        availabilityItems={availabilityItems}
        selectedId={items[0]?.id ?? null}
        modifiedIds={new Set()}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDeleteRequest={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /Champion/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Battle Master/i })).not.toBeInTheDocument()
  })

  it('keeps the selected unavailable row pinned while hidden rows stay filtered', () => {
    render(
      <SubclassListPanel
        items={items}
        availabilityItems={availabilityItems}
        selectedId={items[1]?.id ?? null}
        modifiedIds={new Set()}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDeleteRequest={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /Champion/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Battle Master Homebrew/i })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <SubclassListPanel
        items={items}
        availabilityItems={availabilityItems}
        selectedId={items[0]?.id ?? null}
        modifiedIds={new Set([items[0]!.id])}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDeleteRequest={vi.fn()}
      />,
    )
    await expectNoAxeViolations(container)
  })
})
