import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'

import { SUBCLASSES_FOR_FIGHTER } from '../fixtures'
import { SubclassListPanel } from './subclass-list-panel.client'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

describe('SubclassListPanel', () => {
  const items = SUBCLASSES_FOR_FIGHTER.map((subclass) => ({
    id: subclass.id,
    name: subclass.name,
    source: subclass.source,
    classId: subclass.classId,
  }))

  it('calls onAdd when Add subclass is clicked', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(
      <SubclassListPanel
        items={items}
        selectedId={items[0]?.id ?? null}
        activeById={{}}
        modifiedIds={new Set()}
        onSelect={vi.fn()}
        onAdd={onAdd}
        onDeleteRequest={vi.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Add subclass/i }))
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <SubclassListPanel
        items={items}
        selectedId={items[0]?.id ?? null}
        activeById={{ [items[0]!.id]: false }}
        modifiedIds={new Set([items[0]!.id])}
        onSelect={vi.fn()}
        onAdd={vi.fn()}
        onDeleteRequest={vi.fn()}
      />,
    )
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
