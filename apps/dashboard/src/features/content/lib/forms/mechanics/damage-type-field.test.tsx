import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { z } from 'zod'

import { Form } from '@rpg/ui/form'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import {
  buildPhysicalAndVocabularyDamageTypeFieldOptions,
  buildPhysicalDamageTypeFieldOptions,
  damageTypeField,
} from './damage-type-field'

describe('buildPhysicalDamageTypeFieldOptions', () => {
  it('includes closed physical damage types', () => {
    expect(buildPhysicalDamageTypeFieldOptions()).toEqual([
      { value: 'bludgeoning', label: 'Bludgeoning' },
      { value: 'piercing', label: 'Piercing' },
      { value: 'slashing', label: 'Slashing' },
    ])
  })
})

describe('buildPhysicalAndVocabularyDamageTypeFieldOptions', () => {
  it('includes physical types and seed vocabulary ids without duplicates', () => {
    const options = buildPhysicalAndVocabularyDamageTypeFieldOptions({
      damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
    })
    expect(options.find((option) => option.value === 'piercing')).toEqual({
      value: 'piercing',
      label: 'Piercing',
    })
    expect(options.find((option) => option.value === 'fire')).toEqual({
      value: 'fire',
      label: 'Fire',
    })
  })
})

describe('damageTypeField physical scope', () => {
  it('renders an existing weapon damage type on load', () => {
    render(
      <Form
        schema={z.object({ damageType: z.string() })}
        fields={[damageTypeField({ name: 'damageType', scope: 'physical', ctx: {} })]}
        defaultValues={{ damageType: 'slashing' }}
        onSubmit={() => undefined}
      />,
    )

    expect(screen.getByRole('combobox', { name: 'Physical damage type' })).toHaveTextContent(
      'Slashing',
    )
  })
})
