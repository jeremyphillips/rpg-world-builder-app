import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { z } from 'zod'

import {
  buildDefaultValues,
  fieldDefaultValue,
  type ComboboxFieldConfig,
  type FormItem,
} from '../field-config'
import { Form } from '../shells/form.client'

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

const weaponOptions = [
  { value: 'dagger', label: 'Dagger' },
  { value: 'longsword', label: 'Longsword' },
]

describe('fieldDefaultValue', () => {
  it('defaults multi combobox to [] and optional single combobox to undefined', () => {
    const multi: ComboboxFieldConfig = {
      type: 'combobox',
      name: 'weapons',
      label: 'Weapons',
      options: weaponOptions,
    }
    const single: ComboboxFieldConfig = {
      type: 'combobox',
      name: 'weapon',
      label: 'Weapon',
      options: weaponOptions,
      multiple: false,
    }

    expect(fieldDefaultValue(multi)).toEqual([])
    expect(fieldDefaultValue(single)).toBeUndefined()
    expect(buildDefaultValues([multi, single])).toEqual({ weapons: [], weapon: undefined })
  })
})

const multiSchema = z.object({
  weapons: z.array(z.string()),
})

type MultiValues = z.infer<typeof multiSchema>

const multiFields: FormItem[] = [
  {
    type: 'combobox',
    name: 'weapons',
    label: 'Weapon proficiencies',
    options: weaponOptions,
    multiple: true,
    placeholder: 'Choose weapons…',
  },
]

describe('Form combobox field', () => {
  it('submits multi-select values from the combobox adapter', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Form<MultiValues>
        schema={multiSchema}
        fields={multiFields}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Weapon proficiencies' }))
    await user.click(screen.getByRole('option', { name: 'Dagger' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.lastCall?.[0]).toEqual({ weapons: ['dagger'] })
  })

  it('has no axe violations when rendered through the form renderer', async () => {
    const { container } = render(
      <Form<MultiValues>
        schema={multiSchema}
        fields={multiFields}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )
    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
