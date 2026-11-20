import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { CHALLENGE_RATING_ENTRIES } from '@rpg/contracts'
import { Form, type FormValueSync } from '@rpg/ui/form'
import type { UseFormReturn } from 'react-hook-form'

import {
  MONSTER_AWARDS_ZERO_XP_LABEL,
  MONSTER_CHALLENGE_HEADING,
} from '../../../../lib/monster-form-labels'
import { monsterFormDef } from '../../../../lib/monster-form-def'
import { monsterChallengeRatingMetadataDisplay } from '../../../../lib/statistics/monster-challenge-rating-display.lib'
import { MonsterChallengeRatingZeroXpField } from './challenge-rating-zero-xp.slot'

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

const schema = z.object({
  challengeRating: z.string().optional(),
  experiencePointsOverride: z.number().optional(),
})

type RatingValues = z.infer<typeof schema>

const valueSyncs: FormValueSync[] =
  typeof monsterFormDef.valueSyncs === 'function'
    ? monsterFormDef.valueSyncs({})
    : (monsterFormDef.valueSyncs ?? [])

const ratingOptions = [
  { value: '0', label: CHALLENGE_RATING_ENTRIES['0'].label },
  { value: '1', label: CHALLENGE_RATING_ENTRIES['1'].label },
]

function renderRating(defaultValues: RatingValues) {
  const formRef: { current: UseFormReturn<RatingValues> | null } = { current: null }
  render(
    <Form
      schema={schema}
      fields={[
        {
          type: 'select',
          name: 'challengeRating',
          label: MONSTER_CHALLENGE_HEADING,
          options: ratingOptions,
        },
        monsterChallengeRatingMetadataDisplay(),
        {
          kind: 'slot',
          name: '_challengeRatingZeroXp',
          render: () => <MonsterChallengeRatingZeroXpField />,
        },
      ]}
      defaultValues={defaultValues}
      valueSyncs={valueSyncs}
      onSubmit={vi.fn()}
      footer={(form) => {
        formRef.current = form
        return (
          <button type="button" onClick={() => form.reset()}>
            Reset
          </button>
        )
      }}
    />,
  )
  return formRef
}

function zeroXpCheckbox() {
  return screen.queryByRole('checkbox', { name: MONSTER_AWARDS_ZERO_XP_LABEL })
}

async function chooseRating(user: ReturnType<typeof userEvent.setup>, rating: '0' | '1') {
  await user.click(screen.getByRole('combobox', { name: MONSTER_CHALLENGE_HEADING }))
  const listbox = screen.getByRole('listbox')
  await user.click(
    within(listbox).getByRole('option', { name: CHALLENGE_RATING_ENTRIES[rating].label }),
  )
}

describe('CR 0 zero-XP checkbox', () => {
  it('loads checked when the saved override is 0', async () => {
    const formRef = renderRating({ challengeRating: '0', experiencePointsOverride: 0 })

    expect(zeroXpCheckbox()).toBeChecked()
    expect(screen.getByText(/XP 0/)).toBeTruthy()
    await waitFor(() => {
      expect(formRef.current?.getValues().experiencePointsOverride).toBe(0)
    })
  })

  it('loads unchecked when CR 0 has no override', () => {
    const formRef = renderRating({ challengeRating: '0' })

    expect(zeroXpCheckbox()).not.toBeChecked()
    expect(screen.getByText(/XP 10/)).toBeTruthy()
    expect(formRef.current?.getValues().experiencePointsOverride).toBeUndefined()
  })

  it('hides the checkbox when the loaded rating is not 0', () => {
    renderRating({ challengeRating: '1' })

    expect(zeroXpCheckbox()).toBeNull()
    expect(screen.getByText(/XP 200/)).toBeTruthy()
  })

  it('clears the override when the rating leaves 0 and restores it on reset', async () => {
    const user = userEvent.setup()
    const formRef = renderRating({ challengeRating: '0', experiencePointsOverride: 0 })

    await chooseRating(user, '1')

    await waitFor(() => {
      expect(zeroXpCheckbox()).toBeNull()
      expect(formRef.current?.getValues().experiencePointsOverride).toBeUndefined()
    })
    expect(screen.getByText(/XP 200/)).toBeTruthy()

    await chooseRating(user, '0')

    await waitFor(() => {
      expect(zeroXpCheckbox()).not.toBeChecked()
    })
    expect(screen.getByText(/XP 10/)).toBeTruthy()
    expect(formRef.current?.getValues().experiencePointsOverride).toBeUndefined()

    await user.click(screen.getByRole('button', { name: 'Reset' }))

    await waitFor(() => {
      expect(zeroXpCheckbox()).toBeChecked()
      expect(formRef.current?.getValues().experiencePointsOverride).toBe(0)
    })
    expect(screen.getByText(/XP 0/)).toBeTruthy()
  })

  it('restores an unchecked load after the box is checked', async () => {
    const user = userEvent.setup()
    const formRef = renderRating({ challengeRating: '0' })

    await user.click(screen.getByRole('checkbox', { name: MONSTER_AWARDS_ZERO_XP_LABEL }))
    expect(zeroXpCheckbox()).toBeChecked()
    expect(formRef.current?.getValues().experiencePointsOverride).toBe(0)
    expect(screen.getByText(/XP 0/)).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Reset' }))

    await waitFor(() => {
      expect(zeroXpCheckbox()).not.toBeChecked()
      expect(formRef.current?.getValues().experiencePointsOverride).toBeUndefined()
    })
    expect(screen.getByText(/XP 10/)).toBeTruthy()
  })
})
