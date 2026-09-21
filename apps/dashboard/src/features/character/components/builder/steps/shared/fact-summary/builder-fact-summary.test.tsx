import { render, screen } from '@testing-library/react'
import { WandSparkles } from 'lucide-react'
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
    expect(screen.getByText('Intelligence')).toBeInTheDocument()
    expect(screen.queryByText('Granted by')).not.toBeInTheDocument()
  })
})
