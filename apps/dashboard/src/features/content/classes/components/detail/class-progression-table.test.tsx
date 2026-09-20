import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { makeCharacterClass } from '@/test/fixtures/factories/character-class'
import { defaultCampaignRules } from '../../../lib/form-options/content-campaign-rules'
import { pickClass } from '../../../lib/fixtures/pick'
import { srdSpellcastingProgressionFixture } from '../../lib/fixtures/spellcasting-progression-fixture'
import { ClassProgressionTable } from './class-progression-table'

const SPELLCASTING_PROGRESSION = srdSpellcastingProgressionFixture()

function renderProgressionTable(
  props: Omit<ComponentProps<typeof ClassProgressionTable>, 'spellcastingProgression'>,
) {
  return render(
    <ClassProgressionTable spellcastingProgression={SPELLCASTING_PROGRESSION} {...props} />,
  )
}

describe('ClassProgressionTable', () => {
  it('projects barbarian rage columns with independent carry-forward', () => {
    renderProgressionTable({ characterClass: pickClass('barbarian') })

    expect(screen.getByRole('columnheader', { name: 'Rages' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Rage Damage' })).toBeInTheDocument()

    const rowText = (level: number) => screen.getAllByRole('row')[level]?.textContent ?? ''

    expect(rowText(1)).toContain('2')
    expect(rowText(1)).toContain('+2')
    expect(rowText(6)).toMatch(/4.*\+2/)
    expect(rowText(9)).toMatch(/4.*\+3/)
  })

  it('renders the progression heading and level rows for a spellcaster', () => {
    renderProgressionTable({ characterClass: pickClass('bard') })

    expect(screen.getByRole('heading', { name: 'Class Progression' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Level' })).toBeInTheDocument()

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(21)
    expect(rows[1]?.textContent).toMatch(/^1\+2/)
    expect(rows[20]?.textContent).toMatch(/^20\+6/)
  })

  it('shows prepared spell counts for a prepared caster profile', () => {
    renderProgressionTable({ characterClass: pickClass('sorcerer') })

    expect(screen.getByRole('columnheader', { name: 'Prepared Spells' })).toBeInTheDocument()
  })

  it('shows repertoire spell counts for a known-style caster profile', () => {
    renderProgressionTable({ characterClass: pickClass('bard') })

    expect(screen.getByRole('columnheader', { name: 'Prepared Spells' })).toBeInTheDocument()
  })

  it('hides spellbook gain columns when profile presentation disables them', () => {
    renderProgressionTable({ characterClass: pickClass('wizard') })

    expect(screen.queryByRole('columnheader', { name: 'Spellbook Spells' })).not.toBeInTheDocument()
  })

  it('uses ordinal spell-level slot headers', () => {
    renderProgressionTable({ characterClass: pickClass('wizard') })

    expect(screen.getByRole('columnheader', { name: '1st-level Slots' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '9th-level Slots' })).toBeInTheDocument()
  })

  it('shows the explicit subclass choice feature row', () => {
    renderProgressionTable({ characterClass: pickClass('bard') })

    const level3Row = screen.getAllByRole('row')[3]
    expect(level3Row?.textContent).toContain('Bard Subclass')
  })

  it('hides subclass-choice features when subclassing is disabled', () => {
    renderProgressionTable({
      characterClass: pickClass('bard'),
      campaignRules: {
        ...defaultCampaignRules(),
        subclassing: { enabled: false },
      },
    })

    const level3Row = screen.getAllByRole('row')[3]
    expect(level3Row?.textContent).toMatch(/^3\+2/)
    expect(level3Row?.textContent).not.toContain('Bard Subclass')
  })

  it('derives Spellcasting in the features column from the spellcasting block', () => {
    renderProgressionTable({ characterClass: pickClass('paladin') })

    const level1Row = screen.getAllByRole('row')[1]
    expect(level1Row?.textContent).toContain('Spellcasting')
    expect(level1Row?.textContent).toContain('Lay On Hands')
  })

  it('derives Pact Magic for warlock pact progression', () => {
    renderProgressionTable({ characterClass: pickClass('warlock') })

    const level1Row = screen.getAllByRole('row')[1]
    expect(level1Row?.textContent).toContain('Pact Magic')
  })

  it('gates spell slots before spellcasting unlock level', () => {
    const paladin = pickClass('paladin')
    const delayed = makeCharacterClass({
      ...paladin,
      spellcasting: paladin.spellcasting ? { ...paladin.spellcasting, level: 2 } : undefined,
    })

    renderProgressionTable({ characterClass: delayed })

    const level1Row = screen.getAllByRole('row')[1]
    expect(level1Row?.textContent).not.toContain('Spellcasting')
    const level2Row = screen.getAllByRole('row')[2]
    expect(level2Row?.textContent).toContain('Spellcasting')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderProgressionTable({ characterClass: pickClass('bard') })
    await expectNoAxeViolations(container)
  })

  it('inserts a tier separator when extended progression is active', () => {
    renderProgressionTable({
      characterClass: pickClass('bard'),
      campaignRules: {
        ...defaultCampaignRules(),
        maxCharacterLevel: 30,
        extendedProgression: {
          tierName: 'Epic Destiny',
          startsAt: 21,
          maxLevel: 30,
        },
      },
    })

    expect(screen.getByText('Epic Destiny Tier')).toBeInTheDocument()
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(32)
  })

  it('does not insert a separator for a flat cap above 20 without extended progression', () => {
    renderProgressionTable({
      characterClass: pickClass('bard'),
      campaignRules: {
        ...defaultCampaignRules(),
        maxCharacterLevel: 25,
        standardMaxCharacterLevel: 25,
      },
    })

    expect(screen.queryByText(/Tier$/)).not.toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(26)
  })
})
