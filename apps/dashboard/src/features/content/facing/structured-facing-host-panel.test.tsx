import {
  reincarnateSpeciesTableFixture,
  DEFAULT_SYSTEM_RULESET_ID,
  systemDefaultArmorClassRules,
  type FacingBlock,
} from '@rpg/contracts'
import { render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import { srdSpellcastingProgressionFixture } from '../classes/lib/fixtures/spellcasting-progression-fixture'
import type { facingBlockRenderers } from './facing-block-renderers'
import { facingReasonMessage } from './facing-reason-message'
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

describe('structured preview guidance', () => {
  it('announces a resolver failure once with sanitized guidance', async () => {
    const normalization = await import('../monsters/lib/normalize-monster-form-values')
    const internalMessage = 'private preview normalization failure'
    using normalize = vi
      .spyOn(normalization, 'normalizeMonsterDraftForPreview')
      .mockImplementationOnce(() => {
        throw new Error(internalMessage)
      })
    using logger = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <StructuredFacingHostPanel
        facing={{
          domain: 'monsterAction',
          source: 'draft',
          values: {} as never,
          ctx: {
            rulesetId: DEFAULT_SYSTEM_RULESET_ID,
            armorClassRules: systemDefaultArmorClassRules(),
            equipmentCatalogStatus: 'ready',
            spellCatalogStatus: 'ready',
          },
          actionId: 'bite',
          section: 'actions',
        }}
      />,
    )

    expect(normalize).toHaveBeenCalledOnce()
    expect(logger).toHaveBeenCalledOnce()
    const [announcement] = screen.getAllByRole('status')
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(announcement).toHaveTextContent(facingReasonMessage({ code: 'unexpected' }))
    expect(screen.queryByText(internalMessage)).not.toBeInTheDocument()
  })

  it('keeps authored draft prose visible alongside incomplete guidance', () => {
    render(
      <StructuredFacingHostPanel
        facing={{
          domain: 'classFeature',
          source: 'draft',
          row: {
            kind: 'spellcasting',
            id: 'spellcasting',
            name: 'Spellcasting',
            level: 1,
            intro: '<p>Authored spellcasting introduction.</p>',
          },
          host: {
            className: 'Example',
            rulesetId: DEFAULT_SYSTEM_RULESET_ID,
            spellcastingProgression: srdSpellcastingProgressionFixture(),
          },
        }}
      />,
    )

    expect(screen.getByText('Authored spellcasting introduction.')).toBeInTheDocument()
    expect(
      screen.getByText(facingReasonMessage({ code: 'incomplete-spellcasting' })),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
