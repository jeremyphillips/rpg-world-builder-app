import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { z } from 'zod'

import {
  buildDefaultValues,
  fieldDefaultValue,
  type ComboboxFieldConfig,
  type FormItem,
} from '../../field-config'
import { Form } from '../../shells/form.client'
import { submitAndExpectPayload } from '../../test-utils'

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
  it('applies row fraction width classes beside a 1/3 select', () => {
    const schema = z.object({
      authoringType: z.string(),
      archetype: z.string().optional(),
    })
    const fields: FormItem[] = [
      {
        kind: 'row',
        fields: [
          {
            type: 'select',
            name: 'authoringType',
            label: 'Location type',
            width: '1/3',
            options: [{ label: 'Building', value: 'building' }],
          },
          {
            type: 'combobox',
            name: 'archetype',
            label: 'Archetype',
            width: '2/3',
            multiple: false,
            options: [{ label: 'Inn', value: 'inn' }],
            visibility: {
              dependsOn: ['authoringType'],
              visibleWhen: (values) => values.authoringType === 'building',
            },
            derivedMeta: {
              reserveSpace: true,
              dependsOn: ['archetype'],
              metaWhen: () => ({ rows: [{ label: 'Typical uses', value: 'Lodging' }] }),
            },
          },
        ],
      },
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ authoringType: 'building' }}
        onSubmit={vi.fn()}
      />,
    )

    const locationRoot = screen.getByLabelText('Location type').closest('.grow-\\[4\\]')
    const archetypeRoot = screen.getByLabelText('Archetype').closest('.grow-\\[8\\]')

    expect(locationRoot).toHaveClass('grow-[4]', 'max-w-1/3')
    expect(archetypeRoot).toHaveClass('grow-[8]', 'max-w-2/3')
  })

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
    await submitAndExpectPayload(user, onSubmit, { weapons: ['dagger'] })
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
    await expectNoAxeViolations(container)
  })
})
