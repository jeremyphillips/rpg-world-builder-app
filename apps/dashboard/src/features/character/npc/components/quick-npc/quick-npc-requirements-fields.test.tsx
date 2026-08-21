import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeAll, describe, expect, it } from 'vitest'

import { EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL } from '../../../components/equipment/picker/drawer/equipment-picker-drawer.types'
import {
  createEquipmentStepContextFixture,
  equipmentStepBardClassFixture,
  equipmentStepBattleaxeFixture,
} from '../../../lib/equipment/equipment-step.fixtures'
import {
  quickNpcAuthoringTabDefaultValues,
  type QuickNpcAuthoringTabValues,
} from '../../lib/quick-npc/quick-npc-form-fields'
import { quickNpcMemberSetupWithNoTitle } from '../../lib/quick-npc/quick-npc-test-fixtures'
import { buildQuickNpcRequirementOptionSets } from '../../lib/quick-npc/quick-npc-requirement-options.lib'
import { QuickNpcRequirementsFields } from './quick-npc-requirements-fields.client'

const setup = quickNpcMemberSetupWithNoTitle({
  speciesId: 'species-1',
  classId: equipmentStepBardClassFixture.id,
  level: 1,
})

function RequirementsFieldsHarness() {
  const form = useForm<QuickNpcAuthoringTabValues>({
    defaultValues: quickNpcAuthoringTabDefaultValues,
  })

  const optionSets = buildQuickNpcRequirementOptionSets({
    setup,
    context: createEquipmentStepContextFixture(),
  })

  return (
    <FormProvider {...form}>
      <QuickNpcRequirementsFields optionSets={optionSets} />
    </FormProvider>
  )
}

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

describe('QuickNpcRequirementsFields', () => {
  it('lists campaign-available non-proficient weapons in the combobox panel', async () => {
    const user = userEvent.setup()
    render(<RequirementsFieldsHarness />)

    await user.click(screen.getByRole('combobox', { name: 'Weapons' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search Weapons' }), 'battle')

    const battleaxeOption = screen.getByRole('option', {
      name: new RegExp(equipmentStepBattleaxeFixture.name, 'i'),
    })
    expect(battleaxeOption).toBeInTheDocument()
    expect(screen.getByText(EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL)).toBeInTheDocument()
  })
})
