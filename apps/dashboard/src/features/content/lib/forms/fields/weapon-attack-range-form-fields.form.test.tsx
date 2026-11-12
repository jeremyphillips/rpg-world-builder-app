import {
  equipmentVariantValidationMessages,
  formatFieldMessage,
  weaponRangeSchema,
} from '@rpg/contracts'
import { Form, type FormItem } from '@rpg/ui/form'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { attackRangeRow, weaponAttackRangeGroup } from './weapon-attack-range-form-fields'
import {
  MONSTER_ACTION_DISTANCE_SECTION_LEGEND,
  MONSTER_ACTION_RANGED_RANGE_LABEL,
} from '../../../monsters/lib/monster-form-labels'

const longRangeMessage = formatFieldMessage(
  equipmentVariantValidationMessages.longRangeExceedsNormal(),
)

const schema = z.object({
  range: weaponRangeSchema,
  modes: z.array(z.string()).optional(),
  reach: z.number().optional(),
})

function monsterDistanceFields(): FormItem {
  return {
    kind: 'group',
    legend: MONSTER_ACTION_DISTANCE_SECTION_LEGEND,
    visibility: {
      dependsOn: ['modes'],
      visibleWhen: (values) =>
        Array.isArray(values.modes) &&
        (values.modes.includes('melee') || values.modes.includes('ranged')),
    },
    fields: [
      {
        kind: 'group',
        legend: MONSTER_ACTION_RANGED_RANGE_LABEL,
        headingScale: 'field',
        visibility: {
          dependsOn: ['modes'],
          visibleWhen: (values) => Array.isArray(values.modes) && values.modes.includes('ranged'),
        },
        fields: [
          attackRangeRow({
            normalName: 'range.normal',
            longName: 'range.long',
            normalRequired: true,
          }),
        ],
      },
    ],
  }
}

function rangeFields(): FormItem[] {
  return [
    weaponAttackRangeGroup({
      normalName: 'range.normal',
      longName: 'range.long',
    }),
  ]
}

describe('weaponAttackRangeGroup form', () => {
  it('hides long range behind add until opened', () => {
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: 60 } }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: 'Add long range' })).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Long value' })).not.toBeInTheDocument()
  })

  it('hides add long range until normal is chosen', () => {
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: undefined } }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Add long range' })).not.toBeInTheDocument()
  })

  it('hides add when no greater presets exist', () => {
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: 600 } }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Add long range' })).not.toBeInTheDocument()
  })

  it('keeps long visible when normal clears but long is authored', () => {
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: undefined, long: 240 } }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Add long range' })).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Long value' })).toHaveTextContent('240')
  })

  it('opens an empty long select after add long range', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: 60 } }}
        onSubmit={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Add long range' }))
    const long = screen.getByRole('combobox', { name: 'Long value' })
    expect(long).toBeInTheDocument()
    expect(long).not.toHaveTextContent('60')
  })

  it('keeps an invalid long visible after normal increases', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: 150, long: 120 } }}
        onSubmit={vi.fn()}
        mode="onChange"
        footer={<button type="submit">Save</button>}
      />,
    )
    expect(screen.getByRole('combobox', { name: 'Long value' })).toHaveTextContent('120')
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText(longRangeMessage)).toBeInTheDocument()
  })

  it('clears long on remove', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        fields={rangeFields()}
        defaultValues={{ range: { normal: 60, long: 240 } }}
        onSubmit={vi.fn()}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Remove Long' }))
    await waitFor(() => {
      expect(screen.queryByRole('combobox', { name: 'Long value' })).not.toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Add long range' })).toBeInTheDocument()
  })
})

describe('monster distance nested range form', () => {
  it('renders optional disclosure inside nested ranged range', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        fields={[monsterDistanceFields()]}
        defaultValues={{ modes: ['ranged'], range: { normal: 60 } }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByText(MONSTER_ACTION_RANGED_RANGE_LABEL)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Add long range' }))
    expect(screen.getByRole('combobox', { name: 'Long value' })).toBeInTheDocument()
  })
})
