import { render, screen } from '@testing-library/react'
import { Shield, WandSparkles } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { BuilderFactSummary } from './builder-fact-summary'

describe('BuilderFactSummary', () => {
  it('renders icon rows with a description and no source column', () => {
    render(
      <BuilderFactSummary
        heading="Spellcasting"
        subhead="Your class determines your spellcasting ability and how these values are calculated."
        rows={[
          {
            id: 'ability',
            label: 'Spellcasting ability',
            value: 'Intelligence',
            icon: 'spellcasting-ability',
          },
        ]}
        rowIcons={{ 'spellcasting-ability': WandSparkles }}
        showSourceColumn={false}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Spellcasting' })).toBeInTheDocument()
    const description = screen.getByText(
      'Your class determines your spellcasting ability and how these values are calculated.',
    )
    expect(description).toBeInTheDocument()
    expect(description).toHaveClass('text-sm')
    expect(screen.getByText('Spellcasting ability')).toBeInTheDocument()

    const value = screen.getByText('Intelligence')
    expect(value).toBeInTheDocument()
    expect(value).toHaveClass('text-foreground')
    expect(value).not.toHaveClass('italic')
    expect(value).not.toHaveClass('text-muted-foreground')
    expect(screen.queryByText('Granted by')).not.toBeInTheDocument()
  })

  it('renders unset text italic and muted while set values stay foreground', () => {
    render(
      <BuilderFactSummary
        heading="Spellcasting"
        rows={[
          {
            id: 'save-dc',
            label: 'Spell save DC',
            unsetText: 'Calculated after ability scores',
            icon: 'spell-save-dc',
          },
          {
            id: 'attack',
            label: 'Spell attack modifier',
            value: '+5',
            icon: 'spell-attack',
          },
        ]}
        rowIcons={{ 'spell-save-dc': Shield, 'spell-attack': Shield }}
        showSourceColumn={false}
      />,
    )

    const unset = screen.getByText('Calculated after ability scores')
    expect(unset).toHaveClass('italic')
    expect(unset).toHaveClass('text-muted-foreground')

    const setValue = screen.getByText('+5')
    expect(setValue).toHaveClass('text-foreground')
    expect(setValue).not.toHaveClass('italic')
    expect(setValue).not.toHaveClass('text-muted-foreground')
  })

  it('omits unset placeholder styling when unsetText is not provided', () => {
    render(
      <BuilderFactSummary
        heading="Granted proficiencies"
        grantedRows={[
          {
            kind: 'savingThrows',
            label: 'Saving Throws',
            sourceGroups: [{ sourceLabel: 'Rogue', valueLabels: ['Dexterity'] }],
          },
        ]}
        showSourceColumn
        categoryIcons={{
          savingThrows: Shield,
          skills: Shield,
          tools: Shield,
          languages: Shield,
          weapons: Shield,
          armor: Shield,
        }}
      />,
    )

    const value = screen.getByText('Dexterity')
    expect(value).toHaveClass('text-foreground')
    expect(value).not.toHaveClass('italic')
    expect(screen.queryByText('Calculated after ability scores')).not.toBeInTheDocument()
  })

  it('renders granted summary unset text when value labels are empty', () => {
    render(
      <BuilderFactSummary
        heading="Granted proficiencies"
        grantedRows={[
          {
            kind: 'savingThrows',
            label: 'Saving Throws',
            sourceGroups: [
              {
                sourceLabel: 'Rogue',
                valueLabels: [],
                unsetText: 'Calculated after ability scores',
              },
            ],
          },
        ]}
        showSourceColumn
        categoryIcons={{
          savingThrows: Shield,
          skills: Shield,
          tools: Shield,
          languages: Shield,
          weapons: Shield,
          armor: Shield,
        }}
      />,
    )

    const unset = screen.getByText('Calculated after ability scores')
    expect(unset).toHaveClass('italic')
    expect(unset).toHaveClass('text-muted-foreground')
  })
})
