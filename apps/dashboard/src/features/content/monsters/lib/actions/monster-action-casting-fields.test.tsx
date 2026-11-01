import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import type { MonsterFormValues } from '../monster-form-values'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'
import { MonsterActionCastingAbilityField } from './monster-action-casting-fields'

const SPELLCASTING_ABILITY_LABEL = 'Spellcasting ability'

function Host({ name }: { name: string }) {
  const form = useForm<MonsterFormValues>({ defaultValues: resolveMonsterCreateDefaultValues() })
  return (
    <FormProvider {...form}>
      <MonsterActionCastingAbilityField name={name} sharedOptions={[]} />
    </FormProvider>
  )
}

describe('MonsterActionCastingAbilityField', () => {
  it('renders a schema-styled select for spellcasting ability', () => {
    render(<Host name="actions.0.castingAbility" />)
    expect(screen.getByRole('combobox', { name: SPELLCASTING_ABILITY_LABEL })).toBeInTheDocument()
  })
})
