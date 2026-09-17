import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { reincarnateSpeciesTableFixture } from '@rpg/contracts'
import { RICH_TEXT_TABLE_EMBED_ATTR } from '@rpg/ui'

import { RichTextWithTables } from './rich-text-with-tables'

const embedHtml = `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="reincarnate-species"></div>`

describe('RichTextWithTables', () => {
  it('renders referenced tables from description embeds', () => {
    render(
      <RichTextWithTables
        html={`<p>Roll on the table:</p>${embedHtml}`}
        tables={[reincarnateSpeciesTableFixture]}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'Species' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Dragonborn' })).toBeInTheDocument()
  })

  it('does not render orphan tables absent from description embeds', () => {
    const orphan = { ...reincarnateSpeciesTableFixture, id: 'orphan-table', name: 'Orphan' }

    render(
      <RichTextWithTables html={embedHtml} tables={[reincarnateSpeciesTableFixture, orphan]} />,
    )

    expect(screen.getByRole('columnheader', { name: 'Species' })).toBeInTheDocument()
    expect(screen.queryByRole('columnheader', { name: 'Orphan' })).not.toBeInTheDocument()
  })

  it('shows unavailable copy when an embed references a missing table row', () => {
    render(<RichTextWithTables html={embedHtml} tables={[]} />)

    expect(screen.getByText('Table unavailable')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
