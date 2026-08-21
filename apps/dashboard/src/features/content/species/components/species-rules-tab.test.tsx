import { render, screen, waitFor } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defaultMulticlassingRules } from '@rpg/contracts'

import { TestFormShell } from '@/test/form-shell'
import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { SpeciesRulesTab } from './species-rules-tab'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const { stubUiFormItems } = await import('@/test/mocks/ui-form')
  return stubUiFormItems(importOriginal)
})

function TabShell({ formCtx }: { formCtx: ContentFormCtx }) {
  return (
    <TestFormShell>
      <SpeciesRulesTab formCtx={formCtx} />
    </TestFormShell>
  )
}

function rulesCtx(multiclassing: ReturnType<typeof defaultMulticlassingRules>): ContentFormCtx {
  return makeContentFormCtx({ campaignRules: { multiclassing } })
}

describe('SpeciesRulesTab', () => {
  it('shows a disabled message when multiclassing is off', () => {
    render(
      <TabShell
        formCtx={rulesCtx({
          enabled: false,
          requirements: defaultMulticlassingRules().requirements,
        })}
      />,
    )

    expect(screen.getByText(/Multiclassing is disabled/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Edit multiclassing rules/i })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/homebrew/rules-config/character-configuration#multiclassing',
    )
  })

  it('prompts to enable campaign requirements when both species rules are off', () => {
    render(<TabShell formCtx={rulesCtx(defaultMulticlassingRules())} />)

    expect(
      screen.getByText(/Enable species multiclass policy or species level limits/i),
    ).toBeInTheDocument()
  })

  it('renders editable sections when campaign requirements are enabled', async () => {
    render(
      <TabShell
        formCtx={rulesCtx({
          enabled: true,
          requirements: {
            primaryAbilityMinimum: { enabled: true, minimumScore: 13 },
            speciesPolicy: { enabled: true },
            speciesLevelLimits: { enabled: true },
          },
        })}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('detail-characterCreation-multiclassing')).toBeInTheDocument()
    })
    expect(screen.getByTestId('detail-characterCreation-levelLimits')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Multiclass policy' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Level limits' })).toBeInTheDocument()
  })

  it('shows a disabled policy section when only level limits are enabled', () => {
    render(
      <TabShell
        formCtx={rulesCtx({
          enabled: true,
          requirements: {
            primaryAbilityMinimum: { enabled: true, minimumScore: 13 },
            speciesPolicy: { enabled: false },
            speciesLevelLimits: { enabled: true },
          },
        })}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Multiclass policy' })).toBeInTheDocument()
    expect(screen.getByText(/Species multiclass policy is not enabled/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Level limits' })).toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations when editable', async () => {
    const { container } = render(
      <TabShell
        formCtx={rulesCtx({
          enabled: true,
          requirements: {
            primaryAbilityMinimum: { enabled: true, minimumScore: 13 },
            speciesPolicy: { enabled: true },
            speciesLevelLimits: { enabled: false },
          },
        })}
      />,
    )

    await waitFor(() => {
      expect(screen.getByTestId('detail-characterCreation-multiclassing')).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })
})
