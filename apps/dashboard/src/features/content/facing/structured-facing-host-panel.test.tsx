import { reincarnateSpeciesTableFixture, type FacingBlock } from '@rpg/contracts'
import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, expectTypeOf, it } from 'vitest'

import { srdSpellcastingProgressionFixture } from '../classes/lib/fixtures/spellcasting-progression-fixture'
import type { facingBlockRenderers } from './facing-block-renderers'
import { FacingDetailBody } from './facing-detail-body'
import { StructuredFacingHostPanel } from './structured-facing-host-panel'

describe('dashboard facing tables', () => {
  it('requires table support in the dashboard adapter', () => {
    expectTypeOf({}).not.toMatchTypeOf<typeof facingBlockRenderers>()
  })

  it('renders an authored table in Rules Preview', () => {
    render(
      <StructuredFacingHostPanel
        facing={{
          domain: 'classFeature',
          source: 'draft',
          row: {
            kind: 'custom',
            id: 'return-to-life',
            name: 'Return to Life',
            level: 1,
            tables: [reincarnateSpeciesTableFixture],
          },
          host: {
            className: 'Druid',
            rulesetId: 'srd-cc-5.2.1',
            spellcastingProgression: srdSpellcastingProgressionFixture(),
          },
        }}
      />,
    )

    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Species' })).toBeInTheDocument()
  })

  it('renders tables from a partial published document with its guidance', () => {
    render(
      <FacingDetailBody
        resolution={{
          status: 'incomplete',
          reason: { code: 'incomplete-spellcasting' },
          document: {
            title: 'Incomplete feature',
            blocks: [{ kind: 'table', table: reincarnateSpeciesTableFixture }],
          },
        }}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'Species' })).toBeInTheDocument()
    expect(screen.getByText(/spellcasting/i)).toBeInTheDocument()
  })

  it('rejects an unsupported block in the canonical detail renderer', () => {
    const block = { kind: 'unsupported' }
    expect(() =>
      renderToStaticMarkup(
        <FacingDetailBody
          resolution={{
            status: 'ready',
            document: { title: 'Unsupported feature', blocks: [block as unknown as FacingBlock] },
          }}
        />,
      ),
    ).toThrow('Unsupported facing block')
  })
})
