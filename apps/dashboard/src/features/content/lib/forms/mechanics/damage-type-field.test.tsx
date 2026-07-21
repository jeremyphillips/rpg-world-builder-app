import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { z } from 'zod'

import { Form } from '@rpg/ui/form'

import { buildPhysicalDamageTypeFieldOptions, damageTypeField } from './damage-type-field'

describe('buildPhysicalDamageTypeFieldOptions', () => {
  it('includes closed physical damage types', () => {
    expect(buildPhysicalDamageTypeFieldOptions()).toEqual([
      { value: 'bludgeoning', label: 'Bludgeoning' },
      { value: 'piercing', label: 'Piercing' },
      { value: 'slashing', label: 'Slashing' },
    ])
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
