import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'

import { Wizard, WizardFooter, useWizard, type WizardStepDef } from './wizard.client'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const THREE_STEPS: WizardStepDef[] = [
  { id: 'one', label: 'Identity' },
  { id: 'two', label: 'Rules' },
  { id: 'three', label: 'Review' },
]

/** Minimal step that submits immediately, calling `completeStep` with `values`. */
function SimpleStep({
  heading,
  values = {},
}: {
  heading: string
  values?: Record<string, unknown>
}) {
  const { completeStep } = useWizard()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        completeStep(values)
      }}
    >
      <h2>{heading}</h2>
      <WizardFooter />
    </form>
  )
}

/** Final step that calls `complete()` directly. */
function ReviewStep() {
  const { accumulatedValues, complete } = useWizard()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void complete()
      }}
    >
      <h2>Review</h2>
      <pre data-testid="summary">{JSON.stringify(accumulatedValues)}</pre>
      <WizardFooter submitLabel="Finish" />
    </form>
  )
}

function renderWizard(onComplete = vi.fn()) {
  return render(
    <Wizard steps={THREE_STEPS} onComplete={onComplete}>
      <SimpleStep heading="Step one" values={{ name: 'Alice' }} />
      <SimpleStep heading="Step two" values={{ role: 'wizard' }} />
      <ReviewStep />
    </Wizard>,
  )
}

// ---------------------------------------------------------------------------
// Step nav rendering
// ---------------------------------------------------------------------------

describe('Wizard step nav', () => {
  it('renders a nav landmark with the step labels', () => {
    renderWizard()
    expect(screen.getByRole('navigation', { name: /form steps/i })).toBeInTheDocument()
    expect(screen.getByText('Identity')).toBeInTheDocument()
    expect(screen.getByText('Rules')).toBeInTheDocument()
    expect(screen.getByText('Review')).toBeInTheDocument()
  })

  it('marks the first step as aria-current="step"', () => {
    renderWizard()
    const items = screen.getAllByRole('listitem')
    // First visible step item should have aria-current
    const currentItem = items.find((el) => el.getAttribute('aria-current') === 'step')
    expect(currentItem).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

describe('Wizard navigation', () => {
  it('renders only the first step initially', () => {
    renderWizard()
    expect(screen.getByRole('heading', { name: 'Step one' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Step two' })).not.toBeInTheDocument()
  })

  it('does not show a Back button on the first step', () => {
    renderWizard()
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
  })

  it('advances to the next step when Next is submitted', async () => {
    const user = userEvent.setup()
    renderWizard()
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('heading', { name: 'Step two' })).toBeInTheDocument()
  })

  it('shows a Back button after advancing', async () => {
    const user = userEvent.setup()
    renderWizard()
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('returns to the previous step when Back is clicked', async () => {
    const user = userEvent.setup()
    renderWizard()
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByRole('heading', { name: 'Step one' })).toBeInTheDocument()
  })

  it('shows the submit label on the last step', async () => {
    const user = userEvent.setup()
    renderWizard()
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Value accumulation & completion
// ---------------------------------------------------------------------------

describe('Wizard value accumulation', () => {
  it('accumulates values from each step and passes them to onComplete', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    renderWizard(onComplete)

    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /finish/i }))

    expect(onComplete).toHaveBeenCalledWith({ name: 'Alice', role: 'wizard' })
  })

  it('surfaces accumulated values in the review step', async () => {
    const user = userEvent.setup()
    renderWizard()

    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))

    const summary = screen.getByTestId('summary')
    expect(summary).toHaveTextContent('Alice')
    expect(summary).toHaveTextContent('wizard')
  })
})

// ---------------------------------------------------------------------------
// Hint
// ---------------------------------------------------------------------------

describe('Wizard hint', () => {
  it('renders the hint text when provided', () => {
    render(
      <Wizard
        steps={THREE_STEPS}
        onComplete={() => undefined}
        hint="You can change settings later."
      >
        <SimpleStep heading="Step one" />
        <SimpleStep heading="Step two" />
        <ReviewStep />
      </Wizard>,
    )
    expect(screen.getByText('You can change settings later.')).toBeInTheDocument()
  })

  it('does not render a hint element when omitted', () => {
    renderWizard()
    expect(screen.queryByText(/change settings/i)).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// useWizard guard
// ---------------------------------------------------------------------------

describe('useWizard guard', () => {
  it('throws when used outside a Wizard', () => {
    function Rogue() {
      useWizard()
      return null
    }
    expect(() => render(<Rogue />)).toThrow('useWizard must be used inside <Wizard>')
  })
})

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

describe('Wizard accessibility', () => {
  it('has no axe violations on step 1', async () => {
    const { container } = renderWizard()
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })

  it('has no axe violations on step 2', async () => {
    const user = userEvent.setup()
    const { container } = renderWizard()
    await user.click(screen.getByRole('button', { name: /next/i }))
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })

  it('has no axe violations on the review step', async () => {
    const user = userEvent.setup()
    const { container } = renderWizard()
    await user.click(screen.getByRole('button', { name: /next/i }))
    await user.click(screen.getByRole('button', { name: /next/i }))
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(results.violations).toEqual([])
  })
})
