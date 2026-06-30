import { render, screen, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'
import axe from 'axe-core'
import { describe, expect, it, vi } from 'vitest'
import { defaultMulticlassingRules } from '@rpg/contracts'

import { defaultCampaignRules } from '../../lib/form-options/content-campaign-rules'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { SpeciesRulesTab } from './species-rules-tab.client'

vi.mock('@rpg/ui/form', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    FormItems: ({ namePrefix }: { namePrefix?: string }) => (
      <div data-testid={`detail-${namePrefix?.replace(/\./g, '-')}`}>{namePrefix}</div>
    ),
  }
})

function TabShell({ formCtx }: { formCtx: ContentFormCtx }) {
  const form = useForm({ defaultValues: {} })
  return (
    <MemoryRouter>
      <FormProvider {...form}>
        <SpeciesRulesTab formCtx={formCtx} />
      </FormProvider>
    </MemoryRouter>
  )
}

function rulesCtx(multiclassing: ReturnType<typeof defaultMulticlassingRules>): ContentFormCtx {
  return {
    campaignId: 'camp_1',
    campaignRules: {
      ...defaultCampaignRules(),
      multiclassing,
    },
  }
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

    expect(screen.getByText(/Multiclassing is disabled for this campaign/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Campaign Rules/i })).toHaveAttribute(
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

  it('has no axe accessibility violations when editable', async () => {
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

    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
