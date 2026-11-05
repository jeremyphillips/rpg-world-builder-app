import { render, screen } from '@testing-library/react'
import { buildDefaultValues, Form } from '@rpg/ui/form'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import { damageFieldGroup } from './damage-field-group'

const schema = z.object({
  damageType: z.string().optional(),
  roll: z.object({ dice: z.object({ count: z.number().optional() }).optional() }).optional(),
})

function spellDamageGroup() {
  return damageFieldGroup({
    ctx: {},
    damageTypeName: 'damageType',
    rollName: 'roll',
    scope: 'physical',
    legendVisibility: 'srOnly',
  })
}

describe('damageFieldGroup', () => {
  it('keeps an sr-only Damage legend without section margin inside a parent group', () => {
    render(
      <Form
        schema={schema}
        onSubmit={vi.fn()}
        fields={[
          {
            kind: 'group',
            legend: 'Authored effects',
            fields: [spellDamageGroup()],
          },
        ]}
      />,
    )

    const damage = screen.getByRole('group', { name: 'Damage' })
    expect(damage).toHaveClass('mb-0')
    expect(damage).not.toHaveClass('mb-8')
    expect(damage.querySelector('legend')).toHaveClass('sr-only')
    expect(
      screen.getByRole('spinbutton', { name: 'Damage roll Number of dice' }),
    ).toBeInTheDocument()
  })

  it('does not turn roll defaults into a nested damage value', () => {
    const fields = [
      damageFieldGroup({
        ctx: {},
        damageTypeName: 'damageType',
        rollName: 'damage',
        scope: 'physical',
      }),
    ]
    const defaults = buildDefaultValues(fields)
    expect(defaults).toMatchObject({ 'damage.dice.count': 1, 'damage.dice.faces': 6 })
    expect(defaults.damage).toBeUndefined()
  })
})
