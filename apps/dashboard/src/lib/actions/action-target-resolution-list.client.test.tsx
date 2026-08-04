/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { ActionTargetResolutionList } from './action-target-resolution-list.client'

describe('ActionTargetResolutionList', () => {
  it('renders eligible and blocked rows', () => {
    render(
      <ActionTargetResolutionList
        legend="Apply to"
        rows={[
          {
            targetId: 'a',
            targetName: 'Alpha',
            state: 'eligible',
            checked: true,
            disabled: false,
          },
          {
            targetId: 'b',
            targetName: 'Beta',
            state: 'blocked',
            checked: false,
            disabled: true,
            blockers: [{ kind: 'rule', code: 'in-use', message: 'In use.' }],
          },
        ]}
        campaignId="camp_1"
        onCheckedChange={vi.fn()}
      />,
    )

    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByLabelText('Apply to Alpha')).toBeChecked()
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <ActionTargetResolutionList
        rows={[
          {
            targetId: 'a',
            targetName: 'Alpha',
            state: 'eligible',
            checked: true,
            disabled: false,
          },
        ]}
        onCheckedChange={vi.fn()}
      />,
    )

    await expectNoAxeViolations(container)
  })
})
