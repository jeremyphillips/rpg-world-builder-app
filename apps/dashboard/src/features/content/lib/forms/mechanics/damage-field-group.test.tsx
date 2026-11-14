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
            heading: { label: 'Authored effects' },
            fields: [spellDamageGroup()],
          },
        ]}
      />,
    )

    const damage = screen.getByRole('group', { name: 'Damage' })
    expect(damage).toHaveClass('mb-0')
    expect(damage).not.toHaveClass('mb-8')
    expect(damage.querySelector('legend')).toHaveClass('sr-only')
    expect(screen.getByLabelText('Number of dice')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add dice' })).not.toBeInTheDocument()
  })

  it('does not put roll suggestions into form defaults', () => {
    const fields = [
      damageFieldGroup({
        ctx: {},
        damageTypeName: 'damageType',
        rollName: 'damage',
        scope: 'physical',
      }),
    ]
    const defaults = buildDefaultValues(fields)
    expect(defaults.damage).toBeUndefined()
    expect(defaults['damage.dice.count']).toBeUndefined()
    expect(defaults['damage.dice.faces']).toBeUndefined()
  })
})
