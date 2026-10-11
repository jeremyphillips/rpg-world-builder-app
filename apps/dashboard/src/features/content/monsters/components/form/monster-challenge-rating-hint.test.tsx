import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import {
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../../lib/monster-form-values'
import { MonsterChallengeRatingHint } from './monster-challenge-rating-hint'

function Host({ values }: { values: MonsterFormValues }) {
  const form = useForm<MonsterFormValues>({ defaultValues: values })
  return (
    <FormProvider {...form}>
      <MonsterChallengeRatingHint />
    </FormProvider>
  )
}

describe('MonsterChallengeRatingHint', () => {
  it('shows CR 0 xp hint and awards zero xp toggle', async () => {
    const user = userEvent.setup()
    const values = resolveMonsterCreateDefaultValues()
    values.challengeRating = '0'
    render(<Host values={values} />)
    expect(screen.getByText(/XP 10/)).toBeTruthy()
    await user.click(screen.getByLabelText('Awards 0 XP'))
    expect(screen.getByText(/XP 0/)).toBeTruthy()
  })
})
