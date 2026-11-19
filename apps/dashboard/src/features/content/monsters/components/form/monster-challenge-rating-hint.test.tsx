import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'
import { vi } from 'vitest'

import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { monsterChallengeRatingMetadataDisplay } from '../../lib/statistics/monster-challenge-rating-display.lib'
import { MonsterChallengeRatingZeroXpField } from './monster-challenge-rating-zero-xp-field'

const schema = z.object({
  challengeRating: z.string().optional(),
  experiencePointsOverride: z.number().optional(),
})

describe('Monster challenge rating display', () => {
  it('shows CR 0 xp hint and awards zero xp toggle', async () => {
    const user = userEvent.setup()
    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '0'
    render(
      <Form
        schema={schema}
        fields={[
          {
            type: 'select',
            name: 'challengeRating',
            label: 'Challenge',
            options: [{ value: '0', label: '0' }],
          },
          monsterChallengeRatingMetadataDisplay(),
          {
            kind: 'slot',
            name: '_challengeRatingZeroXp',
            render: () => <MonsterChallengeRatingZeroXpField />,
          },
        ]}
        defaultValues={values as unknown as z.infer<typeof schema>}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )
    expect(screen.getByText(/XP 10/)).toBeTruthy()
    await user.click(screen.getByLabelText('Awards 0 XP'))
    expect(screen.getByText(/XP 0/)).toBeTruthy()
  })
})
