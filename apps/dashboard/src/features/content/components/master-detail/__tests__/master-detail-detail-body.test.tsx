import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { fieldStackRhythmVariants } from '@rpg/ui'

import { resolveFormDensity } from '@rpg/ui/form'
import { MasterDetailDetailBody } from '../master-detail-detail-body'

vi.mock('../../../facing/structured-facing-host-panel', () => ({
  StructuredFacingHostPanel: () => <div data-testid="facing-panel">Facing</div>,
}))

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    FormItems: ({ idPrefix }: { idPrefix?: string }) => (
      <div data-testid={idPrefix ? `form-${idPrefix}` : 'form'} />
    ),
  }
})

function Shell({ children }: { children: ReactNode }) {
  const methods = useForm({ defaultValues: { features: [{ level: 1, intro: '' }] } })
  return <FormProvider {...methods}>{children}</FormProvider>
}

vi.mock('../../../monsters/components/form/spells/spell-picker-host', () => ({
  MonsterSpellPickerHost: ({ children }: { children: ReactNode }) => (
    <div data-testid="spell-scope">{children}</div>
  ),
}))

describe('MasterDetailDetailBody', () => {
  it('uses one outer FormRhythmStack for leading fields, facing, and primary fields', () => {
    render(
      <Shell>
        <MasterDetailDetailBody
          leadingItemFields={[
            {
              type: 'select',
              name: 'level',
              label: 'Level',
              options: [{ value: '1', label: '1' }],
            },
          ]}
          primaryItemFields={[{ type: 'richtext', name: 'intro', label: 'Introduction' }]}
          facing={{
            domain: 'classFeature',
            source: 'draft',
            row: { kind: 'custom', name: 'Feature' },
            host: { className: 'Example', rulesetId: 'srd-cc-5.2.1' },
          }}
          idPrefix="class-feature"
          selectedFieldId="row-1"
          namePrefix="features.0"
        />
      </Shell>,
    )

    const facing = screen.getByTestId('facing-panel')
    const leading = screen.getByTestId('form-class-feature-row-1-leading')
    const primary = screen.getByTestId('form-class-feature-row-1-primary')
    const rhythmStack = facing.parentElement
    const rhythmTokens = fieldStackRhythmVariants({
      rhythm: resolveFormDensity().rhythm,
    }).split(/\s+/)
    expect(rhythmStack).toBeTruthy()
    expect(rhythmTokens.every((token) => rhythmStack!.classList.contains(token))).toBe(true)
    expect(leading.compareDocumentPosition(facing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(facing.compareDocumentPosition(primary) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('renders shell-owned primary FormItems inside the spell picker provider', () => {
    render(
      <Shell>
        <MasterDetailDetailBody
          primaryItemFields={[{ type: 'text', name: 'spell', label: 'Spell' }]}
          idPrefix="monster-action"
          selectedFieldId="row-1"
          namePrefix="actions.0"
          spellPicker={{ enabled: true, catalog: undefined }}
        />
      </Shell>,
    )

    const scope = screen.getByTestId('spell-scope')
    expect(scope).toContainElement(screen.getByTestId('form-monster-action-row-1-primary'))
  })

  it('omits empty leading sections without extra rhythm nodes', () => {
    const { container } = render(
      <Shell>
        <MasterDetailDetailBody
          primaryItemFields={[{ type: 'text', name: 'notes', label: 'Notes' }]}
          idPrefix="trait"
          selectedFieldId="row-1"
          namePrefix="traits.0"
        />
      </Shell>,
    )

    expect(screen.getByTestId('form-trait-row-1-primary')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="facing-panel"]')).toBeNull()
  })
})
