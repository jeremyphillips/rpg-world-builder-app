import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { InlineSentenceField } from '../../components/ui/inline-sentence-field.client'
import { Form } from '../shells/form.client'
import type { FormItem } from '../field-config'

const selectOnlySchema = z.object({
  unlockLevel: z.string(),
})

const countAndSelectSchema = z.object({
  choose: z.number(),
  poolSource: z.enum(['filtered', 'explicit']),
})

const countAndChipsSchema = z.object({
  choose: z.number(),
  skills: z.array(z.string()),
})

describe('InlineSentenceField form integration', () => {
  it('submits a select-only inline sentence', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    const fields: FormItem[] = [
      {
        type: 'inlineSentence',
        name: 'unlockLevel',
        label: 'Granted at',
        hideLabel: true,
        segments: [
          { kind: 'text', value: 'Granted at', tone: 'label' },
          {
            kind: 'select',
            name: 'unlockLevel',
            options: [
              { value: 'default', label: 'When feature is gained' },
              { value: '4', label: 'Level 4' },
            ],
            width: 'lg',
            defaultValue: 'default',
          },
        ],
      },
    ]

    render(
      <Form
        schema={selectOnlySchema}
        fields={fields}
        defaultValues={{ unlockLevel: 'default' }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({ unlockLevel: 'default' }, expect.anything())
  })

  it('shows a default placeholder on select-only inline sentences', () => {
    render(
      <Form
        schema={selectOnlySchema}
        fields={[
          {
            type: 'inlineSentence',
            name: 'unlockLevel',
            label: 'Granted at',
            hideLabel: true,
            segments: [
              { kind: 'text', value: 'Granted at', tone: 'label' },
              {
                kind: 'select',
                name: 'unlockLevel',
                options: [{ value: 'default', label: 'When feature is gained' }],
              },
            ],
          },
        ]}
        defaultValues={{}}
        onSubmit={vi.fn()}
        footer={null}
      />,
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Select Granted at…')
  })

  it('keeps prose-length select triggers on the inline row', () => {
    const { container } = render(
      <InlineSentenceField
        id="unlock-level"
        label="Granted at"
        hideLabel
        segments={[
          { kind: 'text', value: 'Granted at', tone: 'label' },
          {
            kind: 'select',
            name: 'unlockLevel',
            options: [{ value: 'default', label: 'When feature is gained' }],
          },
        ]}
        controls={[
          {
            kind: 'select',
            id: 'unlock-level-select',
            name: 'unlockLevel',
            value: 'default',
            options: [{ value: 'default', label: 'When feature is gained' }],
            ariaLabel: 'Granted at',
          },
        ]}
      />,
    )

    const trigger = container.querySelector('#unlock-level-select')
    expect(trigger).toHaveClass('w-fit', 'shrink-0')
    expect(trigger).not.toHaveClass('w-full')
  })

  it('applies segment width tokens to prose-length select triggers', () => {
    const { container } = render(
      <InlineSentenceField
        id="unlock-level"
        label="Granted at"
        hideLabel
        segments={[
          { kind: 'text', value: 'Granted at', tone: 'label' },
          {
            kind: 'select',
            name: 'unlockLevel',
            options: [{ value: 'default', label: 'When feature is gained' }],
            width: 'lg',
          },
        ]}
        controls={[
          {
            kind: 'select',
            id: 'unlock-level-select',
            name: 'unlockLevel',
            value: 'default',
            options: [{ value: 'default', label: 'When feature is gained' }],
            width: 'lg',
            ariaLabel: 'Granted at',
          },
        ]}
      />,
    )

    const trigger = container.querySelector('#unlock-level-select')
    expect(trigger).toHaveClass('w-48', 'max-w-48', 'shrink-0')
  })

  it('submits count and trailing select values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    const fields: FormItem[] = [
      {
        type: 'inlineSentence',
        name: 'choose',
        label: 'Choice count',
        hideLabel: true,
        segments: [
          { kind: 'text', value: 'Character chooses', tone: 'label' },
          { kind: 'number', name: 'choose', min: 1, defaultValue: 1 },
          { kind: 'text', value: 'item(s) from', tone: 'label' },
          {
            kind: 'select',
            name: 'poolSource',
            options: [
              { value: 'filtered', label: 'A category of equipment' },
              { value: 'explicit', label: 'A list of specific items' },
            ],
            defaultValue: 'filtered',
            ariaLabel: 'Pool source',
          },
        ],
      },
    ]

    render(
      <Form
        schema={countAndSelectSchema}
        fields={fields}
        defaultValues={{ choose: 1, poolSource: 'filtered' }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({ choose: 1, poolSource: 'filtered' }, expect.anything())
  })

  it('submits count and below chips values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    const fields: FormItem[] = [
      {
        type: 'inlineSentence',
        name: 'skills',
        label: 'Skills',
        hideLabel: true,
        segments: [
          { kind: 'text', value: 'Choose', tone: 'label' },
          { kind: 'number', name: 'choose', min: 0, defaultValue: 1 },
          { kind: 'text', value: 'skills from:', tone: 'label' },
        ],
        below: {
          kind: 'chips',
          name: 'skills',
          options: [
            { value: 'athletics', label: 'Athletics' },
            { value: 'stealth', label: 'Stealth' },
          ],
        },
      },
    ]

    render(
      <Form
        schema={countAndChipsSchema}
        fields={fields}
        defaultValues={{ choose: 1, skills: ['athletics'] }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledWith({ choose: 1, skills: ['athletics'] }, expect.anything())
  })
})
