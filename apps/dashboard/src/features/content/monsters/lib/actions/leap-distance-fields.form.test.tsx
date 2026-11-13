import { LEAP_DISTANCE_EXCEEDS_MOVEMENT_MESSAGE } from '@rpg/contracts'
import { Form } from '@rpg/ui/form'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { z } from 'zod'

import { leapDistanceFields } from './leap-distance-options'

const fields = [{ kind: 'row' as const, fields: leapDistanceFields() }]

const schema = z
  .object({
    distanceFeet: z.number().int().min(1).max(300),
    movementFeet: z.number().int().min(1).max(299),
    movement: z
      .array(z.object({ mode: z.string().optional(), feet: z.union([z.number(), z.literal('')]) }))
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.distanceFeet > value.movementFeet) return
    ctx.addIssue({
      code: 'custom',
      message: LEAP_DISTANCE_EXCEEDS_MOVEMENT_MESSAGE,
      path: ['distanceFeet'],
    })
  })

describe('leap distance fields', () => {
  it('keeps an equal cost visible and reports the relationship on jump distance', async () => {
    const user = userEvent.setup()
    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{
          id: 'leap',
          kind: 'leap',
          name: 'Leap',
          distanceFeet: 10,
          movementFeet: 10,
          movement: [{ mode: 'walk', feet: 30 }],
        }}
        onSubmit={vi.fn()}
        mode="onChange"
        footer={<button type="submit">Save</button>}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Jump distance value' })).toHaveTextContent('10')
    expect(screen.getByRole('combobox', { name: 'Movement spent value' })).toHaveTextContent('10')
    expect(
      screen.getByText('Movement required to make the jump. Walk Speed: 30 ft.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText(LEAP_DISTANCE_EXCEEDS_MOVEMENT_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByText('How far the creature jumps.')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Movement spent value' })).toHaveTextContent('10')
  })

  it('omits the Walk Speed clause when walk is missing', () => {
    render(
      <Form
        schema={schema}
        fields={fields}
        defaultValues={{
          id: 'leap',
          kind: 'leap',
          name: 'Leap',
          distanceFeet: 30,
          movementFeet: 10,
        }}
        onSubmit={vi.fn()}
      />,
    )
    expect(screen.getByText('Movement required to make the jump.')).toBeInTheDocument()
    expect(screen.queryByText(/Walk Speed:/)).not.toBeInTheDocument()
  })
})
