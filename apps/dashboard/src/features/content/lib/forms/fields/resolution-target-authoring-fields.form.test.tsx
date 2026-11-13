import { Form } from '@rpg/ui/form'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { resolutionTargetAuthoringFields } from './resolution-target-authoring-fields'

const schema = z.object({
  resolution: z.object({
    target: z.object({
      count: z.number().optional(),
      countKind: z.string().optional(),
      kind: z.string().optional(),
      proximity: z
        .object({
          kind: z.string().optional(),
          distance: z
            .object({ value: z.number().optional(), unit: z.string().optional() })
            .optional(),
        })
        .optional(),
      requirements: z.array(z.record(z.string(), z.unknown())).optional(),
    }),
  }),
})

describe('resolution target authoring form', () => {
  it('adds an incomplete size row and previews the sentence', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(
      <Form
        schema={schema}
        fields={resolutionTargetAuthoringFields({
          prefix: 'resolution.target',
          creatureTypeOptions: [{ value: 'humanoid', label: 'Humanoid' }],
        })}
        defaultValues={{
          resolution: {
            target: {
              count: 1,
              kind: 'creature',
              proximity: { kind: 'distance', distance: { value: 5, unit: 'ft' } },
            },
          },
        }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByText('Optional restrictions on who can be targeted.')).toBeInTheDocument()
    expect(screen.getByText('One creature within 5 feet', { exact: false })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Add a requirement' }))
    await user.click(screen.getByRole('menuitem', { name: /Size limit/i }))

    expect(screen.getByText('Eligible sizes')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Size' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Size limit' })).toHaveTextContent('or smaller')

    await user.click(screen.getByRole('button', { name: 'Save' }))
    const requirements = onSubmit.mock.calls[0]?.[0]?.resolution.target.requirements
    expect(requirements).toEqual([{ kind: 'size', comparison: 'or-smaller', bound: '' }])
  })

  it('omits the bundled reach or range select when includeProximityKindSelect is false', () => {
    render(
      <Form
        schema={schema}
        fields={resolutionTargetAuthoringFields({
          prefix: 'resolution.target',
          includeProximityKindSelect: false,
        })}
        defaultValues={{
          resolution: {
            target: {
              count: 1,
              kind: 'creature',
              proximity: { kind: 'reach', distance: { value: 5, unit: 'ft' } },
            },
          },
        }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.queryByLabelText('Reach or range')).not.toBeInTheDocument()
    expect(screen.getByText('One creature within 5 feet', { exact: false })).toBeInTheDocument()
  })

  it('omits the empty requirements well and hides disclosure for willing rows', () => {
    render(
      <Form
        schema={schema}
        fields={resolutionTargetAuthoringFields({
          prefix: 'resolution.target',
          creatureTypeOptions: [{ value: 'humanoid', label: 'Humanoid' }],
        })}
        defaultValues={{
          resolution: {
            target: {
              count: 1,
              kind: 'creature',
              proximity: { kind: 'distance', distance: { value: 5, unit: 'ft' } },
              requirements: [{ kind: 'willing' }],
            },
          },
        }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.queryByText(/No requirement added/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Expand requirement/i })).not.toBeInTheDocument()
  })
})
