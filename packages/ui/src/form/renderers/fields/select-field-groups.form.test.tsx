import { beforeAll, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { FormItems } from '../../containers/form-items.client'
import type { FormItem } from '../../field-config'

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

function Harness({ items, defaultValues = {} }: { items: FormItem[]; defaultValues?: object }) {
  const form = useForm({ defaultValues })
  return (
    <FormProvider {...form}>
      <FormItems items={items} idPrefix="test" />
    </FormProvider>
  )
}

const groupedAbilityOptions = [
  {
    kind: 'group' as const,
    label: 'Common abilities',
    options: [
      {
        value: 'str',
        label: 'Strength',
        trailing: { text: '+8 to hit', variant: 'strong' as const },
      },
      { value: 'dex', label: 'Dexterity' },
    ],
  },
  {
    kind: 'group' as const,
    label: 'Other abilities',
    options: [{ value: 'con', label: 'Constitution' }],
  },
]

describe('schema select groups', () => {
  it('renders static group labels and trailing text on the closed trigger', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        defaultValues={{ ability: 'con' }}
        items={[
          {
            type: 'select',
            name: 'ability',
            label: 'Ability',
            options: groupedAbilityOptions,
          },
        ]}
      />,
    )

    const trigger = screen.getByRole('combobox', { name: 'Ability' })
    expect(trigger).toHaveTextContent('Constitution')
    await user.click(trigger)
    expect(screen.getByText('Common abilities')).toBeInTheDocument()
    expect(screen.getByText('Other abilities')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Strength +8 to hit' })).toBeInTheDocument()
  })

  it('keeps dynamic groups and disables options inside a group', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        defaultValues={{ mode: 'common' }}
        items={[
          {
            type: 'select',
            name: 'ability',
            label: 'Ability',
            optionsResolve: {
              dependsOn: ['mode'],
              optionsWhen: () => groupedAbilityOptions,
            },
            optionAvailability: {
              dependsOn: ['mode'],
              enabledWhen: (values, optionValue) =>
                values.mode !== 'common' || optionValue !== 'con',
            },
          },
        ]}
      />,
    )

    await user.click(screen.getByRole('combobox', { name: 'Ability' }))
    expect(screen.getByText('Common abilities')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Constitution' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('treats a single option inside a group as the sole read-only value', () => {
    render(
      <Harness
        defaultValues={{ ability: 'str' }}
        items={[
          {
            type: 'select',
            name: 'ability',
            label: 'Ability',
            options: [
              {
                kind: 'group',
                label: 'Common abilities',
                options: [{ value: 'str', label: 'Strength' }],
              },
            ],
            presentation: {
              readOnlyWhen: ({ options }) => options.length === 1,
            },
          },
        ]}
      />,
    )

    expect(screen.getByLabelText('Ability')).toHaveTextContent('Strength')
    expect(screen.queryByRole('combobox', { name: 'Ability' })).not.toBeInTheDocument()
  })

  it('keeps a grouped select editable when the group has more than one option', () => {
    render(
      <Harness
        items={[
          {
            type: 'select',
            name: 'ability',
            label: 'Ability',
            options: groupedAbilityOptions,
            presentation: {
              readOnlyWhen: ({ options }) => options.length === 1,
            },
          },
        ]}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Ability' })).toBeInTheDocument()
  })
})
