import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

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

describe('field renderer characterization', () => {
  it('validates text on blur and waits to submit for select and text suggestions', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const schema = z.object({
      name: z.string().min(1, 'Name is required.'),
      kind: z.string().min(1, 'Kind is required.'),
      note: z.string().min(1, 'Note is required.'),
    })
    const fields: FormItem[] = [
      { type: 'text', name: 'name', label: 'Name', required: true },
      {
        type: 'select',
        name: 'kind',
        label: 'Kind',
        required: true,
        options: [{ value: 'inn', label: 'Inn' }],
      },
      {
        type: 'textSuggestions',
        name: 'note',
        label: 'Note',
        required: true,
        suggestions: { dependsOn: ['kind'], suggestionsWhen: () => ['coaching inn'] },
      },
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ name: '', kind: '', note: '' }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    fireEvent.blur(screen.getByRole('textbox', { name: 'Name' }))
    fireEvent.blur(screen.getByRole('combobox', { name: 'Kind' }))
    fireEvent.blur(screen.getByRole('textbox', { name: 'Note' }))
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument()
    expect(screen.queryByText('Kind is required.')).not.toBeInTheDocument()
    expect(screen.queryByText('Note is required.')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Name is required.')).toBeInTheDocument()
    expect(screen.getByText('Kind is required.')).toBeInTheDocument()
    expect(screen.getByText('Note is required.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('updates text suggestions when a dependency changes and disables unavailable chips', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      driver: z.string().optional(),
      refinement: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    const fields: FormItem[] = [
      { type: 'text', name: 'driver', label: 'Driver' },
      {
        type: 'textSuggestions',
        name: 'refinement',
        label: 'Refinement',
        suggestions: {
          dependsOn: ['driver'],
          suggestionsWhen: (values) => (values.driver === 'inn' ? ['coaching inn'] : ['roadside']),
        },
      },
      {
        type: 'chips',
        name: 'tags',
        label: 'Tags',
        options: [
          { value: 'inn', label: 'Inn tag' },
          { value: 'other', label: 'Other tag' },
        ],
        optionAvailability: {
          dependsOn: ['driver'],
          enabledWhen: (values, option) => option !== 'inn' || values.driver === 'inn',
        },
      },
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ driver: '', refinement: '', tags: [] }}
        onSubmit={() => {}}
      />,
    )

    expect(screen.getByRole('checkbox', { name: 'Roadside' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Inn tag' })).toBeDisabled()

    await user.type(screen.getByRole('textbox', { name: 'Driver' }), 'inn')
    expect(screen.getByRole('checkbox', { name: 'Coaching inn' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Roadside' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Inn tag' })).toBeEnabled()
  })

  it('renders derived metadata and unmounts a hidden field', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      show: z.boolean().optional(),
      detail: z.string().optional(),
    })
    const fields: FormItem[] = [
      { type: 'switch', name: 'show', label: 'Show detail' },
      {
        type: 'text',
        name: 'detail',
        label: 'Detail',
        visibility: { dependsOn: ['show'], visibleWhen: (values) => values.show === true },
        derivedMeta: {
          dependsOn: ['show'],
          metaWhen: () => ({ rows: [{ label: 'Typical uses', value: 'Care' }] }),
        },
      },
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ show: false, detail: '' }}
        onSubmit={() => {}}
      />,
    )

    expect(screen.queryByRole('textbox', { name: 'Detail' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: 'Show detail' }))
    expect(screen.getByRole('textbox', { name: 'Detail' })).toBeInTheDocument()
    expect(screen.getByText('Care')).toBeInTheDocument()
  })

  it('mounts radio, file, dice, joined pair, and editable grid controls', async () => {
    const schema = z.object({
      choice: z.string().optional(),
      portrait: z.array(z.unknown()).optional(),
      roll: z.object({ count: z.number(), faces: z.number() }).optional(),
      distance: z.string().optional(),
      grid: z.record(z.string(), z.array(z.number().nullable())).optional(),
    })
    const fields: FormItem[] = [
      {
        type: 'radio',
        name: 'choice',
        label: 'Choice',
        options: [{ value: 'a', label: 'Alpha' }],
      },
      { type: 'file', name: 'portrait', label: 'Portrait' },
      { type: 'diceFormula', name: 'roll', label: 'Roll', modifierMode: 'optional' },
      {
        type: 'joinedPair',
        label: 'Distance',
        start: {
          kind: 'select',
          name: 'distance',
          ariaLabel: 'Distance',
          options: [{ value: '5', label: '5' }],
        },
        end: { kind: 'label', text: 'ft', ariaLabel: 'feet' },
      },
      {
        type: 'editableGrid',
        name: 'grid',
        label: 'Grid',
        rowCount: 1,
        columns: [{ key: 'count', label: 'Count', control: 'number' }],
      },
    ]

    render(<Form schema={schema} fields={fields} onSubmit={() => {}} />)

    expect(screen.getByRole('radio', { name: 'Alpha' })).toBeInTheDocument()
    expect(await screen.findByText('Portrait')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Roll' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Distance' })).toBeInTheDocument()
    expect(screen.getByText('Grid')).toBeInTheDocument()
  })

  it('suppresses compact row field errors behind one row summary', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      grants: z.array(z.object({ rarity: z.string().min(1), quantity: z.string().min(1) })),
    })
    const fields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        heading: { label: 'Grants' },
        errorPlacement: 'row',
        item: {
          variant: 'compact',
          header: { fallback: (index) => `Grant ${index + 1}`, srOnly: true },
        },
        fields: [
          { type: 'select', name: 'rarity', label: 'Rarity', options: [], required: true },
          { type: 'text', name: 'quantity', label: 'Quantity', required: true },
        ],
        addAction: { label: 'Add grant' },
        min: 1,
      },
    ]

    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{ grants: [{ rarity: '', quantity: '' }] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Rarity' })).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    })
    expect(screen.queryByText('Choose a rarity.')).not.toBeInTheDocument()
    const summary = screen.getByRole('alert')
    expect(summary).toHaveTextContent('Choose a rarity.')
    expect(screen.getByRole('combobox', { name: 'Rarity' })).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('summary'),
    )
  })
})
