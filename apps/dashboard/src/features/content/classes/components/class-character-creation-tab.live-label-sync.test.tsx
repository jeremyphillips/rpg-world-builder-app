import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { loadSeedEquipment } from '@rpg/catalog/equipment'

import { pickClass } from '../../lib/fixtures/pick'
import { ClassCharacterCreationTab } from './class-character-creation-tab.client'
import { characterCreationProficienciesToFormValues } from '../lib/character-creation/class-character-creation-proficiencies-form-values'
import { startingEquipmentToFormValues } from '../lib/character-creation/class-starting-equipment-form-values'
import { startingEquipmentItemTitle } from '../lib/character-creation/class-starting-equipment-form-fields'
import { buildProficiencyChoiceTargetOptions } from '../lib/character-creation/class-starting-equipment-proficiency-targets.lib'

const monk = pickClass('monk')
const equipment = loadSeedEquipment('srd-cc-5.2.1')

function LiveLabelSyncHarness() {
  const form = useForm({
    defaultValues: {
      characterCreation: {
        proficiencies: characterCreationProficienciesToFormValues(monk.characterCreation),
        startingEquipment: startingEquipmentToFormValues(
          monk.characterCreation!.startingEquipment!,
        ),
      },
    },
  })

  const proficiencies = form.watch('characterCreation.proficiencies')
  const startingEquipment = form.watch('characterCreation.startingEquipment')
  const options = buildProficiencyChoiceTargetOptions({
    rulesetId: monk.rulesetId,
    classId: monk.id,
    proficiencies,
    equipment,
    startingEquipment,
  })
  const linkedItem = startingEquipment.options[0]?.items.find(
    (item) => item.itemKind === 'grant' && item.grantTargetSource === 'proficiency_choice',
  )

  return (
    <FormProvider {...form}>
      <ClassCharacterCreationTab
        formCtx={{ entityId: monk.id, options: { equipmentEntities: equipment } }}
      />
      <div data-testid="linked-title">{startingEquipmentItemTitle(linkedItem, 0, [], options)}</div>
      <div data-testid="linked-option-label">{options[0]?.label}</div>
      <button
        type="button"
        onClick={() =>
          form.setValue('characterCreation.proficiencies.tools.label', 'Renamed Tool Choice')
        }
      >
        Rename label
      </button>
    </FormProvider>
  )
}

describe('ClassCharacterCreationTab live label sync', () => {
  it('updates linked equipment title and option label when the choice label changes', async () => {
    const user = userEvent.setup()
    render(<LiveLabelSyncHarness />)

    await waitFor(() => {
      expect(screen.getByTestId('linked-title')).toHaveTextContent(
        'Tool selected in "Artisan\'s Tools or Musical Instrument"',
      )
    })
    expect(screen.getByTestId('linked-option-label')).toHaveTextContent(
      "Artisan's Tools or Musical Instrument",
    )

    await user.click(screen.getByRole('button', { name: 'Rename label' }))

    await waitFor(() => {
      expect(screen.getByTestId('linked-title')).toHaveTextContent(
        'Tool selected in "Renamed Tool Choice"',
      )
    })
    expect(screen.getByTestId('linked-option-label')).toHaveTextContent('Renamed Tool Choice')
    expect(
      screen.getByText('The selected tool is also granted by the Standard Equipment option.'),
    ).toBeInTheDocument()
  })
})
