import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getEditionPresetMechanics } from '@rpg/contracts'
import { Form, type FormProps } from '@rpg/ui/form'
import { describe, expect, it, vi } from 'vitest'
import type { UseFormReturn } from 'react-hook-form'

import { disableFormItems } from '@/lib/disable-form-items'

import {
  buildMechanicsConfigFields,
  buildMechanicsValueSyncs,
  mechanicsValuesSchema,
  type MechanicsValues,
} from './mechanics-form-fields'
import { buildMechanicsPatchInput, defaultMechanicsValues } from './mechanics-form-values'

const editionPresetOptions = [
  { value: '5e', label: 'Modern 5e' },
  { value: 'becmi', label: 'Classic Basic' },
]
const attackResolutionModeOptions = [
  { value: 'proficiency_attack_vs_ac', label: 'd20 versus AC' },
  { value: 'attack_matrix', label: 'Attack matrix' },
]

function fields() {
  return buildMechanicsConfigFields({ editionPresetOptions, attackResolutionModeOptions })
}

function MechanicsHarness({
  defaultValues = defaultMechanicsValues(),
  readOnly = false,
}: {
  defaultValues?: MechanicsValues
  readOnly?: boolean
}) {
  const footer: FormProps<MechanicsValues>['footer'] = (form: UseFormReturn<MechanicsValues>) => (
    <>
      <output aria-label="dirty">{form.formState.isDirty ? 'dirty' : 'clean'}</output>
      <output aria-label="payload">
        {JSON.stringify(buildMechanicsPatchInput(form.getValues()))}
      </output>
      <button type="button" onClick={() => form.reset(form.getValues())}>
        Reset saved values
      </button>
    </>
  )

  return (
    <Form
      schema={mechanicsValuesSchema}
      fields={readOnly ? disableFormItems(fields(), true) : fields()}
      defaultValues={defaultValues}
      valueSyncs={buildMechanicsValueSyncs()}
      onSubmit={vi.fn()}
      footer={footer}
    />
  )
}

describe('mechanics edition preset value syncs', () => {
  it('does not dirty the form or rewrite knobs on the initial load', () => {
    render(
      <MechanicsHarness
        defaultValues={{
          ...defaultMechanicsValues(),
          editionPresetId: 'becmi',
          armorClassMode: 'ascending',
          armorClassBase: '10',
        }}
      />,
    )

    expect(screen.getByRole('radio', { name: 'Ascending' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Base 10 (unarmored)' })).toBeChecked()
    expect(screen.getByLabelText('dirty')).toHaveTextContent('clean')
  })

  it('writes the preset knobs and marks the form dirty when the preset changes', async () => {
    const user = userEvent.setup()
    const becmi = getEditionPresetMechanics('becmi')
    render(<MechanicsHarness />)

    await user.click(screen.getByRole('radio', { name: 'Classic Basic' }))

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Descending' })).toBeChecked()
    })
    expect(screen.getByRole('radio', { name: 'Base 9 (unarmored)' })).toBeChecked()
    expect(screen.getByRole('combobox', { name: /attack resolution mode/i })).toHaveTextContent(
      'Attack matrix',
    )
    expect(screen.getByLabelText('dirty')).toHaveTextContent('dirty')
    expect(JSON.parse(screen.getByLabelText('payload').textContent ?? '{}')).toMatchObject({
      editionPreset: { id: 'becmi' },
      armorClass: { mode: becmi.armorClass.mode, base: becmi.armorClass.base },
      attackResolution: { mode: becmi.attackResolution.mode },
    })
  })

  it('does not re-apply the bundle when save resets the same values', async () => {
    const user = userEvent.setup()
    render(<MechanicsHarness />)

    await user.click(screen.getByRole('radio', { name: 'Classic Basic' }))
    await waitFor(() => {
      expect(screen.getByRole('radio', { name: 'Descending' })).toBeChecked()
    })

    await user.click(screen.getByRole('button', { name: 'Reset saved values' }))

    expect(screen.getByRole('radio', { name: 'Descending' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Classic Basic' })).toBeChecked()
    expect(screen.getByLabelText('dirty')).toHaveTextContent('clean')
  })

  it('leaves loaded knobs alone when the preset control is read-only', () => {
    render(
      <MechanicsHarness
        readOnly
        defaultValues={{
          ...defaultMechanicsValues(),
          armorClassMode: 'descending',
          armorClassBase: '9',
        }}
      />,
    )

    expect(screen.getByRole('radio', { name: 'Classic Basic' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'Descending' })).toBeChecked()
    expect(screen.getByLabelText('dirty')).toHaveTextContent('clean')
  })
})
