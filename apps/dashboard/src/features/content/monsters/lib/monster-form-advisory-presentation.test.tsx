/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { MonsterFormAdvisory } from './monster-form-advisories'
import {
  advisoriesForRowPath,
  monsterFormAdvisorySlot,
  monsterFormAdvisoryTone,
} from './monster-form-advisory-presentation'

const weaponNotes: MonsterFormAdvisory[] = [
  { code: 'weapon-not-equipped', message: 'Row one', path: 'actions.1' },
  { code: 'weapon-not-proficient', message: 'Row ten', path: 'actions.10' },
  { code: 'weapon-not-equipped', message: 'Nested', path: 'actions.1.note' },
]

describe('monster form advisory presentation', () => {
  it('maps known codes and still shows an unknown code as warning', () => {
    expect(monsterFormAdvisoryTone('weapon-not-equipped')).toBe('warning')
    expect(monsterFormAdvisoryTone('weapon-not-proficient')).toBe('info')
    expect(monsterFormAdvisoryTone('tunneler-missing-burrow-speed')).toBe('warning')
    expect(monsterFormAdvisoryTone('flyby-missing-fly-speed')).toBe('warning')
    expect(monsterFormAdvisoryTone('future-code')).toBe('warning')

    const slot = monsterFormAdvisorySlot(
      [
        {
          code: 'future-code' as MonsterFormAdvisory['code'],
          message: 'Still shown.',
          path: 'actions.0',
        },
      ],
      'actions.0',
    )
    render(<>{slot.render()}</>)
    const note = screen.getByText('Still shown.')
    expect(note.closest('.ui-alert')).toHaveClass('ui-alert--warning')
  })

  it('matches a row, its nested path, and not the sibling index', () => {
    expect(
      advisoriesForRowPath(weaponNotes, 'actions.1').map((advisory) => advisory.message),
    ).toEqual(['Row one', 'Nested'])
    expect(
      advisoriesForRowPath(weaponNotes, 'actions.10').map((advisory) => advisory.message),
    ).toEqual(['Row ten'])
    expect(
      advisoriesForRowPath(
        [
          {
            code: 'tunneler-missing-burrow-speed',
            message: 'Tunnel',
            path: 'traits.0',
          },
          { code: 'flyby-missing-fly-speed', message: 'Fly', path: 'traits.1' },
        ],
        'traits.0',
      ).map((advisory) => advisory.path),
    ).toEqual(['traits.0'])
  })

  it('renders nothing when the row has no match and does not collect', () => {
    const slot = monsterFormAdvisorySlot(weaponNotes, 'actions.2')
    expect(slot.name).toBe('buildAdvisories')
    expect(slot.render()).toBeNull()
  })
})
