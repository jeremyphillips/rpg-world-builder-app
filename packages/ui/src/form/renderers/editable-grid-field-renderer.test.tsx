import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { z } from 'zod'

import {
  editableGridDependsOn,
  fieldDefaultValue,
  type EditableGridFieldConfig,
  type FormItem,
} from './field-config'
import { resolveEditableGridColumns } from './editable-grid-field.client'
import { Form } from './form.client'

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

const columns = [
  {
    key: 'cantrips',
    label: 'Cantrips',
    control: 'select' as const,
    min: 1,
    max: 3,
  },
  {
    key: 'count',
    label: (watched: Record<string, unknown>) =>
      watched['preparation'] === 'known' ? 'Spells known' : 'Spells prepared',
    control: 'number' as const,
    labelDependsOn: ['preparation'],
    visibility: {
      dependsOn: ['preparation'],
      visibleWhen: (watched: Record<string, unknown>) =>
        watched['preparation'] !== 'always_prepared',
    },
  },
]

describe('editableGridDependsOn', () => {
  it('collects visibility and dynamic-label dependencies', () => {
    expect(editableGridDependsOn(columns).sort()).toEqual(['preparation'])
  })
})

describe('resolveEditableGridColumns', () => {
  it('hides columns when visibility is false and resolves dynamic labels', () => {
    expect(
      resolveEditableGridColumns(columns, { preparation: 'always_prepared' }).map((c) => c.key),
    ).toEqual(['cantrips'])

    const prepared = resolveEditableGridColumns(columns, { preparation: 'prepared' })
    expect(prepared.map((c) => c.key)).toEqual(['cantrips', 'count'])
    expect(prepared[1]?.label).toBe('Spells prepared')

    const known = resolveEditableGridColumns(columns, { preparation: 'known' })
    expect(known[1]?.label).toBe('Spells known')
  })
})

describe('fieldDefaultValue', () => {
  it('builds a null-filled grid for every configured column', () => {
    const field: EditableGridFieldConfig = {
      type: 'editableGrid',
      name: 'progressionTable',
      label: 'Progression',
      rowCount: 2,
      columns,
    }

    expect(fieldDefaultValue(field)).toEqual({
      cantrips: [null, null],
      count: [null, null],
    })
  })
})

const schema = z.object({
  preparation: z.enum(['prepared', 'known', 'always_prepared']),
  progressionTable: z.record(z.string(), z.array(z.number().nullable())),
})

type Values = z.infer<typeof schema>

const fields: FormItem[] = [
  {
    type: 'select',
    name: 'preparation',
    label: 'Preparation',
    options: [
      { value: 'prepared', label: 'Prepared' },
      { value: 'known', label: 'Known' },
      { value: 'always_prepared', label: 'Always prepared' },
    ],
  },
  {
    type: 'editableGrid',
    name: 'progressionTable',
    label: 'Spell progression',
    rowCount: 2,
    columns,
  },
]

describe('EditableGrid in Form', () => {
  it('hides a conditional column and updates its header label', async () => {
    const user = userEvent.setup()
    render(
      <Form<Values>
        schema={schema}
        fields={fields}
        onSubmit={vi.fn()}
        defaultValues={{
          preparation: 'prepared',
          progressionTable: { cantrips: [null, null], count: [null, null] },
        }}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(await screen.findByRole('columnheader', { name: /Spells prepared/ })).toBeInTheDocument()

    await user.click(screen.getByLabelText('Preparation'))
    await user.click(screen.getByRole('option', { name: 'Known' }))
    expect(await screen.findByRole('columnheader', { name: /Spells known/ })).toBeInTheDocument()

    await user.click(screen.getByLabelText('Preparation'))
    await user.click(screen.getByRole('option', { name: 'Always prepared' }))
    expect(screen.queryByRole('columnheader', { name: /Spells known/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: /Spells prepared/ })).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <Form<Values>
        schema={schema}
        fields={fields}
        onSubmit={vi.fn()}
        defaultValues={{
          preparation: 'prepared',
          progressionTable: { cantrips: [null, null], count: [null, null] },
        }}
        footer={<button type="submit">Save</button>}
      />,
    )

    await screen.findByRole('columnheader', { name: /Spells prepared/ })

    const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
