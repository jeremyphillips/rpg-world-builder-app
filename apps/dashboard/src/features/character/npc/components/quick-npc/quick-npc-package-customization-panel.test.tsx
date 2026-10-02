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
