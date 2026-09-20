import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { resolveSpellcastingProgressionFormState } from '../lib/rules/character-configuration/spellcasting-progression-form-values'
import { SpellcastingProgressionField } from './spellcasting-progression-field'

function SpellcastingProgressionFieldHarness({
  defaultValues,
}: {
  defaultValues: {
    maxCharacterLevel: number
    extendedProgressionEnabled: boolean
    extendedMaxLevel?: number
    extendedTierName?: string
    slotProgressions: ReturnType<typeof resolveSpellcastingProgressionFormState>['slotProgressions']
    profiles: ReturnType<typeof resolveSpellcastingProgressionFormState>['profiles']
  }
}) {
  const form = useForm({ defaultValues })

  return (
    <FormProvider {...form}>
      <SpellcastingProgressionField />
    </FormProvider>
  )
}

describe('SpellcastingProgressionField', () => {
  it('lists seeded slot progressions and profiles', () => {
    const spellcasting = resolveSpellcastingProgressionFormState(undefined)

    render(
      <SpellcastingProgressionFieldHarness
        defaultValues={{
          maxCharacterLevel: 20,
          extendedProgressionEnabled: false,
          ...spellcasting,
        }}
      />,
    )

    expect(screen.getAllByRole('button', { name: 'Add custom' })).toHaveLength(2)
    expect(screen.getByText('Full caster')).toBeInTheDocument()
    expect(screen.getByText('Half caster')).toBeInTheDocument()
    expect(screen.getByText('Pact Magic')).toBeInTheDocument()
    expect(screen.getByText('Bard spellcasting')).toBeInTheDocument()
  })
})
