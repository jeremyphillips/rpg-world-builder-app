/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { ACTION_RESOLUTION_ISSUE_ROW_STATES } from './action-resolution-row.lib'
import { ActionTargetResolutionList } from './action-target-resolution-list'

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
    expect(screen.getByText('Blocked')).toHaveClass('eyebrow-style-xs')
  })

  it.each(ACTION_RESOLUTION_ISSUE_ROW_STATES)(
    'renders %s rows with shared issue chrome and an alignment checkbox',
    (state) => {
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
            {
              targetId: 'b',
              targetName: 'Beta',
              state,
              checked: false,
              disabled: true,
              ...(state === 'blocked'
                ? {
                    blockers: [{ kind: 'rule', code: 'in-use', message: 'In use.' }],
                  }
                : {
                    failure: { code: 'network', message: 'Could not reach the server.' },
                  }),
            },
          ]}
          campaignId="camp_1"
          onCheckedChange={vi.fn()}
        />,
      )

      const issueRow = screen.getByText('Beta').closest('li')
      expect(issueRow).toHaveClass('bg-destructive-subtle')
      expect(issueRow).not.toHaveClass('text-destructive')
      expect(screen.getByText(state === 'blocked' ? 'Blocked' : 'Failed')).toHaveClass(
        'eyebrow-style-xs',
      )

      if (state === 'failed') {
        expect(screen.getByText('Could not reach the server.')).toHaveClass('text-muted-foreground')
      }

      const checkboxes = container.querySelectorAll('[role="checkbox"]')
      expect(checkboxes).toHaveLength(2)
      expect(checkboxes[1]).toHaveAttribute('aria-hidden', 'true')
      expect(checkboxes[1]).not.toBeChecked()
      expect(checkboxes[1]).toBeDisabled()
    },
  )

  itAxe('has no axe accessibility violations', async () => {
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
