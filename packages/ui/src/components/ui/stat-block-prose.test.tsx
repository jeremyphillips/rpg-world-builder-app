import { monsterAttackActionPartsToProse } from '@rpg/contracts'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { StatBlockProseView } from './stat-block-prose'

describe('StatBlockProseView', () => {
  it('renders lead segments with stat-block-lead', () => {
    const prose = monsterAttackActionPartsToProse({
      attackLabel: 'Melee Attack Roll',
      bonusAndDistance: '+5, reach 5 ft.',
      hitBody: '7 (1d8 + 3) Piercing damage',
    })
    const { container } = render(<StatBlockProseView prose={prose} />)
    const leads = container.querySelectorAll('.stat-block-lead--inline')
    expect(leads).toHaveLength(2)
    expect(leads[0]?.textContent).toBe('Melee Attack Roll:')
    expect(leads[1]?.textContent).toBe('Hit:')
    expect(container.textContent).toContain('Melee Attack Roll:')
    expect(container.textContent).toContain('Hit:')
  })
})
