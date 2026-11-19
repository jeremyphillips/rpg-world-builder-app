import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'

import { FormItems } from '../../../containers/form-items.client'
import type { FormItem } from '../../../field-config'

function Harness({
  items,
  defaultValues = {},
}: {
  items: FormItem[]
  defaultValues?: Record<string, unknown>
}) {
  const form = useForm({ defaultValues })
  return (
    <FormProvider {...form}>
      <FormItems items={items} idPrefix="test" />
    </FormProvider>
  )
}

describe('FormItems combobox optionalDisclosure', () => {
  it('renders an add control for an empty multi combobox', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        items={[
          {
            type: 'combobox',
            name: 'creatureFamilyIds',
            label: 'Creature families',
            multiple: true,
            options: [{ value: 'demon', label: 'Demon' }],
            optionalDisclosure: {
              intent: 'add',
              addLabel: 'Add families',
              removeLabel: 'Remove families',
            },
          },
        ]}
      />,
    )
    expect(screen.getByRole('button', { name: 'Add families' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add families' }))
    expect(screen.getByRole('combobox', { name: 'Creature families' })).toBeInTheDocument()
  })

  it('expands populated multi values and clears on remove', async () => {
    const user = userEvent.setup()
    render(
      <Harness
        defaultValues={{ creatureFamilyIds: ['demon'] }}
        items={[
          {
            type: 'combobox',
            name: 'creatureFamilyIds',
            label: 'Creature families',
            multiple: true,
            options: [{ value: 'demon', label: 'Demon' }],
            optionalDisclosure: {
              intent: 'add',
              addLabel: 'Add families',
              removeLabel: 'Remove families',
            },
          },
        ]}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Creature families' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove families' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add families' })).toBeInTheDocument()
    })
  })

  it('fills the anatomy row column when width is a row fraction', () => {
    render(
      <Harness
        defaultValues={{ creatureFamilyIds: ['demon'] }}
        items={[
          {
            kind: 'row',
            fields: [
              {
                type: 'combobox',
                name: 'creatureFamilyIds',
                label: 'Creature families',
                multiple: true,
                width: '1/2',
                options: [{ value: 'demon', label: 'Demon' }],
                optionalDisclosure: {
                  intent: 'add',
                  addLabel: 'Add families',
                  removeLabel: 'Remove families',
                },
              },
              {
                type: 'combobox',
                name: 'filler',
                label: 'Filler',
                width: '1/2',
                options: [],
              },
            ],
          },
        ]}
      />,
    )

    const combobox = screen.getByRole('combobox', { name: 'Creature families' })
    const leafRoot = combobox.closest('[data-field-anatomy]')
    expect(leafRoot).toBeTruthy()
    expect(leafRoot).toHaveClass('ui-field-control--width-full')
    expect(leafRoot).not.toHaveClass('ui-field-control--width-1/2')
  })

  it('hoists below-control hints to the row message region in anatomy rows', () => {
    const { container } = render(
      <Harness
        defaultValues={{ creatureFamilyIds: ['demon'] }}
        items={[
          {
            kind: 'row',
            fields: [
              {
                type: 'combobox',
                name: 'creatureFamilyIds',
                label: 'Creature families',
                multiple: true,
                width: '1/2',
                hint: { text: 'Pick one or more.', position: 'below-control' },
                options: [{ value: 'demon', label: 'Demon' }],
                optionalDisclosure: {
                  intent: 'add',
                  addLabel: 'Add families',
                  removeLabel: 'Remove families',
                },
              },
            ],
          },
        ]}
      />,
    )

    const hint = container.querySelector('#test-creatureFamilyIds-hint')
    expect(hint).toHaveTextContent('Pick one or more.')
    expect(hint?.closest('[data-field-message-region]')).not.toBeNull()
    expect(hint?.closest('[data-field-control-region]')).toBeNull()
  })
})
