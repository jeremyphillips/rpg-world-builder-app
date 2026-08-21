import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { equipmentPickerBudgetFixture } from '../drawer/equipment-picker-drawer.fixtures'
import { EquipmentBudgetHeader } from './equipment-budget-header.client'

describe('EquipmentBudgetHeader', () => {
  it('renders remaining on its own line with muted starting and spent meta', () => {
    render(<EquipmentBudgetHeader budget={equipmentPickerBudgetFixture} />)

    expect(screen.getByText('40 GP remaining')).toBeInTheDocument()
    expect(screen.getByText('100 GP starting · 15 GP spent')).toHaveClass('text-muted-foreground')
    expect(screen.queryByText(/^Budget:/)).not.toBeInTheDocument()
  })
})
