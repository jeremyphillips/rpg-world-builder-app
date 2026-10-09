import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { Button } from './button.client'
import {
  InfoTooltip,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip.client'

describe('InfoTooltip', () => {
  it('renders a focusable button with the required accessible name', () => {
    render(<InfoTooltip aria-label="About alignment">A moral compass.</InfoTooltip>)
    const trigger = screen.getByRole('button', { name: 'About alignment' })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveClass('cursor-pointer')
  })

  it('reveals the tooltip content on keyboard focus', async () => {
    const user = userEvent.setup()
    render(<InfoTooltip aria-label="About alignment">A moral compass.</InfoTooltip>)
    await user.tab()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('A moral compass.')
  })

  it('uses pointer cursor on interactive triggers', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger interactive asChild>
            <Button variant="outline">Action</Button>
          </TooltipTrigger>
          <TooltipContent>Details</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect(screen.getByRole('button', { name: 'Action' })).toHaveClass('cursor-pointer')
  })
})

describe('TooltipTrigger', () => {
  it('uses default cursor on passive triggers', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span data-testid="passive-trigger">Status</span>
          </TooltipTrigger>
          <TooltipContent>Details</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    )

    expect(screen.getByTestId('passive-trigger')).toHaveClass('cursor-default')
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <InfoTooltip aria-label="About alignment">A moral compass.</InfoTooltip>,
    )
    await expectNoAxeViolations(container)
  })
})
