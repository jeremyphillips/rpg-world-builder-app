import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { QuickNpcPackageCustomizationPanel } from './quick-npc-package-customization-panel'

const rows = [
  {
    entryId: 'chain-mail',
    label: 'Chain Mail',
    packageQuantity: 1,
    retainedQuantity: 1,
    kind: 'singleton' as const,
  },
  {
    entryId: 'javelin',
    label: 'Javelin',
    packageQuantity: 8,
    retainedQuantity: 8,
    kind: 'stack' as const,
  },
]

describe('QuickNpcPackageCustomizationPanel', () => {
  it('shows selection status on a package row, including after it is removed', () => {
    const status = [
      {
        kind: 'badge' as const,
        label: 'Not proficient',
        tone: 'warning' as const,
        appearance: 'soft' as const,
      },
      { kind: 'text' as const, variant: 'guidance' as const, label: 'Required by class' },
    ]
    render(
      <QuickNpcPackageCustomizationPanel
        packageLabel="Heavy Armor"
        rows={[
          { ...rows[0]!, status },
          { ...rows[1]!, retainedQuantity: 0, status },
        ]}
        draftQuantities={{ javelin: 0 }}
        submittedQuantities={{}}
        showLockMessage={false}
        onChangeQuantity={vi.fn()}
        onRemove={vi.fn()}
        onRestore={vi.fn()}
        onRestoreAll={vi.fn()}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    expect(screen.getAllByText('Not proficient')).toHaveLength(2)
    expect(screen.getAllByText('Required by class')).toHaveLength(2)
    expect(screen.getByText('Removed')).toBeInTheDocument()
  })

  it('disables save until a quantity changes and restores a removed singleton', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    const onRestore = vi.fn()
    const onSave = vi.fn()

    const { rerender } = render(
      <QuickNpcPackageCustomizationPanel
        packageLabel="Heavy Armor"
        rows={rows}
        wealthLabel="4 GP"
        draftQuantities={{}}
        submittedQuantities={{}}
        showLockMessage={false}
        onChangeQuantity={vi.fn()}
        onRemove={onRemove}
        onRestore={onRestore}
        onRestoreAll={vi.fn()}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    )

    expect(screen.getByRole('button', { name: 'Save customization' })).toBeDisabled()
    expect(
      screen.getByText("Also includes 4 GP. Starting wealth isn't customized here."),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove Chain Mail from Heavy Armor' }))
    expect(onRemove).toHaveBeenCalledWith('chain-mail', 1)

    rerender(
      <QuickNpcPackageCustomizationPanel
        packageLabel="Heavy Armor"
        rows={[{ ...rows[0]!, retainedQuantity: 0 }, rows[1]!]}
        wealthLabel="4 GP"
        draftQuantities={{ 'chain-mail': 0 }}
        submittedQuantities={{}}
        showLockMessage
        onChangeQuantity={vi.fn()}
        onRemove={onRemove}
        onRestore={onRestore}
        onRestoreAll={vi.fn()}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    )

    expect(screen.getByText('Removed')).toBeInTheDocument()
    expect(screen.getByText('Save or cancel your package changes to continue.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save customization' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Restore Chain Mail' }))
    expect(onRestore).toHaveBeenCalledWith('chain-mail')
  })
})
