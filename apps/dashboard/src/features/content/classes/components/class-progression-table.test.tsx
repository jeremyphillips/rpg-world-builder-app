import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { defaultMulticlassingRules } from '@rpg/contracts'
import axe from 'axe-core'
import type { CharacterClass } from '@rpg/contracts'

import { pickClass } from '../../lib/fixtures/pick'
import { ClassProgressionTable } from './class-progression-table'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

describe('ClassProgressionTable', () => {
  it('renders the progression heading and level rows for a spellcaster', () => {
    render(<ClassProgressionTable characterClass={pickClass('bard')} />)

    expect(screen.getByRole('heading', { name: 'Class Progression' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Level' })).toBeInTheDocument()

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(21)
    expect(rows[1]?.textContent).toMatch(/^1\+2/)
    expect(rows[20]?.textContent).toMatch(/^20\+6/)
  })

  it('shows Spells Prepared for a prepared caster', () => {
    render(<ClassProgressionTable characterClass={pickClass('sorcerer')} />)

    expect(screen.getByRole('columnheader', { name: 'Spells Prepared' })).toBeInTheDocument()
  })

  it('shows Spells Known for a known caster with a spells-available table', () => {
    const bard = pickClass('bard')
    const knownCaster: CharacterClass = {
      ...bard,
      spellcasting: bard.spellcasting ? { ...bard.spellcasting, preparation: 'known' } : undefined,
    }

    render(<ClassProgressionTable characterClass={knownCaster} />)

    expect(screen.getByRole('columnheader', { name: 'Spells Known' })).toBeInTheDocument()
  })

  it('hides the spells-available column for always_prepared mode', () => {
    const cleric = pickClass('cleric')
    const alwaysPrepared: CharacterClass = {
      ...cleric,
      spellcasting: cleric.spellcasting
        ? {
            ...cleric.spellcasting,
            preparation: 'always_prepared',
            spellsAvailable: undefined,
          }
        : undefined,
    }

    render(<ClassProgressionTable characterClass={alwaysPrepared} />)

    expect(screen.queryByRole('columnheader', { name: 'Spells Prepared' })).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Spells Known' })).not.toBeInTheDocument()
  })

  it('uses ordinal spell-level slot headers', () => {
    render(<ClassProgressionTable characterClass={pickClass('wizard')} />)

    expect(screen.getByRole('columnheader', { name: '1st-level Slots' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '9th-level Slots' })).toBeInTheDocument()
  })

  it('shows the subclass choice label at subclassChoiceLevel', () => {
    render(<ClassProgressionTable characterClass={pickClass('bard')} />)

    const level3Row = screen.getAllByRole('row')[3]
    expect(level3Row?.textContent).toContain('Bard Subclass')
  })

  it('derives Spellcasting in the features column from the spellcasting block', () => {
    render(<ClassProgressionTable characterClass={pickClass('paladin')} />)

    const level1Row = screen.getAllByRole('row')[1]
    expect(level1Row?.textContent).toContain('Spellcasting')
    expect(level1Row?.textContent).toContain('Lay On Hands')
  })

  it('derives Pact Magic for warlock pact progression', () => {
    render(<ClassProgressionTable characterClass={pickClass('warlock')} />)

    const level1Row = screen.getAllByRole('row')[1]
    expect(level1Row?.textContent).toContain('Pact Magic')
  })

  it('gates spell slots before spellcasting unlock level', () => {
    const paladin = pickClass('paladin')
    const delayed: CharacterClass = {
      ...paladin,
      spellcasting: paladin.spellcasting ? { ...paladin.spellcasting, level: 2 } : undefined,
    }

    render(<ClassProgressionTable characterClass={delayed} />)

    const level1Row = screen.getAllByRole('row')[1]
    expect(level1Row?.textContent).not.toContain('Spellcasting')
    const level2Row = screen.getAllByRole('row')[2]
    expect(level2Row?.textContent).toContain('Spellcasting')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(<ClassProgressionTable characterClass={pickClass('bard')} />)
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })

  it('inserts a tier separator when extended progression is active', () => {
    render(
      <ClassProgressionTable
        characterClass={pickClass('bard')}
        campaignRules={{
          maxCharacterLevel: 30,
          standardMaxCharacterLevel: 20,
          allowedCharacterCreatureTypes: ['humanoid'],
          multiclassing: defaultMulticlassingRules(),
          extendedProgression: {
            tierName: 'Epic Destiny',
            startsAt: 21,
            maxLevel: 30,
          },
        }}
      />,
    )

    expect(screen.getByText('Epic Destiny Tier')).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(32)
  })

  it('does not insert a separator for a flat cap above 20 without extended progression', () => {
    render(
      <ClassProgressionTable
        characterClass={pickClass('bard')}
        campaignRules={{
          maxCharacterLevel: 25,
          standardMaxCharacterLevel: 25,
          allowedCharacterCreatureTypes: ['humanoid'],
          multiclassing: defaultMulticlassingRules(),
        }}
      />,
    )

    expect(screen.queryByText(/Tier$/)).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(26)
  })
})
