import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  EQUIPMENT_PACKAGE_CHANGE_OPTION_LABEL,
  EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL,
} from '../../lib/equipment/equipment-step.lib'
import { EquipmentStartingPackageToolbar } from './equipment-starting-package-toolbar.client'

describe('EquipmentStartingPackageToolbar', () => {
  it('renders customize and change option as link buttons', async () => {
    const user = userEvent.setup()
    const onCustomize = vi.fn()
    const onChangeEquipmentOption = vi.fn()

    render(
      <EquipmentStartingPackageToolbar
        customizeDisabled={false}
        onCustomize={onCustomize}
        onChangeEquipmentOption={onChangeEquipmentOption}
      />,
    )

    await user.click(screen.getByRole('button', { name: EQUIPMENT_PACKAGE_CUSTOMIZE_LABEL }))
    await user.click(screen.getByRole('button', { name: EQUIPMENT_PACKAGE_CHANGE_OPTION_LABEL }))

    expect(onCustomize).toHaveBeenCalledTimes(1)
    expect(onChangeEquipmentOption).toHaveBeenCalledTimes(1)
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <EquipmentStartingPackageToolbar
        customizeDisabled={false}
        onCustomize={() => undefined}
        onChangeEquipmentOption={() => undefined}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
