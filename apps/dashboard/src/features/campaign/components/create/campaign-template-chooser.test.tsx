import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import type { CampaignTemplate } from '@rpg/contracts'

import {
  BLANK_CAMPAIGN_TEMPLATE_VALUE,
  CampaignTemplateChooser,
} from './campaign-template-chooser.client'

const template: CampaignTemplate = {
  metadata: {
    id: 'classic-adventure',
    slug: 'classic-adventure',
    version: '1.0.0',
    name: 'Classic Adventure',
    description: '<p>Heroic fantasy with room to explore.</p>',
  },
  rulesetId: 'srd-cc-5.2.1',
  defaults: {},
  worldSeedPackIds: [],
}

describe('CampaignTemplateChooser', () => {
  it('offers a blank campaign and reports a selected shipped template', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <CampaignTemplateChooser
        templates={[template]}
        value={BLANK_CAMPAIGN_TEMPLATE_VALUE}
        onValueChange={onValueChange}
      />,
    )

    expect(screen.getByText('Heroic fantasy with room to explore.')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /Classic Adventure/i }))
    expect(onValueChange).toHaveBeenCalledWith('classic-adventure')
  })

  it('keeps blank creation available when template discovery fails', () => {
    render(
      <CampaignTemplateChooser
        templates={[]}
        value={BLANK_CAMPAIGN_TEMPLATE_VALUE}
        onValueChange={vi.fn()}
        isError
      />,
    )

    expect(screen.getByRole('radio', { name: /Blank campaign/i })).toBeChecked()
    expect(screen.getByRole('alert')).toHaveTextContent(/still create a blank campaign/i)
  })

  itAxe('has no axe violations', async () => {
    const { container } = render(
      <CampaignTemplateChooser
        templates={[template]}
        value={BLANK_CAMPAIGN_TEMPLATE_VALUE}
        onValueChange={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
