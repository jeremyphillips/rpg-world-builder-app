import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion.client'

describe('Accordion', () => {
  it('renders triggers and panel content', () => {
    render(
      <Accordion type="single" collapsible defaultValue="one">
        <AccordionItem value="one">
          <AccordionTrigger>Section one</AccordionTrigger>
          <AccordionContent>Panel one</AccordionContent>
        </AccordionItem>
        <AccordionItem value="two">
          <AccordionTrigger>Section two</AccordionTrigger>
          <AccordionContent>Panel two</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    expect(screen.getByRole('button', { name: 'Section one' })).toBeInTheDocument()
    expect(screen.getByText('Panel one')).toBeInTheDocument()
  })

  it('toggles panel visibility when the trigger is clicked', async () => {
    const user = userEvent.setup()
    render(
      <Accordion type="single" collapsible defaultValue="one">
        <AccordionItem value="one">
          <AccordionTrigger>Section one</AccordionTrigger>
          <AccordionContent>Panel one</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    const trigger = screen.getByRole('button', { name: 'Section one' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps forceMount content visually collapsed after closing', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <Accordion type="single" collapsible defaultValue="one">
        <AccordionItem value="one">
          <AccordionTrigger>Section one</AccordionTrigger>
          <AccordionContent forceMount>
            <p>Panel one</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    const trigger = screen.getByRole('button', { name: 'Section one' })
    const content = container.querySelector('[data-state]') as HTMLElement | null
    expect(content).not.toBeNull()

    await user.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(content).toHaveAttribute('data-state', 'closed')
    expect(content?.offsetHeight).toBe(0)
  })

  it('applies overflow-visible on open content for focus ring clearance', () => {
    const { container } = render(
      <Accordion type="single" collapsible defaultValue="one" variant="section">
        <AccordionItem value="one">
          <AccordionTrigger>Section one</AccordionTrigger>
          <AccordionContent forceMount>
            <input aria-label="Field" />
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    const openContent = container.querySelector('[role="region"][data-state="open"]')
    expect(openContent?.className).toContain('data-[state=open]:overflow-visible')
  })

  it('applies field group legend typography on section variant triggers', () => {
    render(
      <Accordion type="single" collapsible defaultValue="one" variant="section">
        <AccordionItem value="one">
          <AccordionTrigger>Section one</AccordionTrigger>
          <AccordionContent>Panel one</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )

    expect(screen.getByRole('button', { name: 'Section one' })).toHaveClass(
      'text-field-group-legend',
    )
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <Accordion type="multiple" defaultValue={['one']}>
        <AccordionItem value="one">
          <AccordionTrigger>Section one</AccordionTrigger>
          <AccordionContent>Panel one</AccordionContent>
        </AccordionItem>
      </Accordion>,
    )
    await expectNoAxeViolations(container)
  })
})
