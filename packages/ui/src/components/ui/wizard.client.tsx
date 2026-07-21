'use client'

import * as React from 'react'
import { CheckIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Text } from './text'
import {
  wizardStepBubbleVariants,
  wizardStepLabelVariants,
  wizardConnectorVariants,
  wizardFooterVariants,
} from './wizard.variants'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WizardStepDef {
  id: string
  label: string
}

interface WizardContextValue {
  currentStepIndex: number
  steps: WizardStepDef[]
  isFirstStep: boolean
  isLastStep: boolean
  /** Merged values submitted by all completed steps so far. */
  accumulatedValues: Record<string, unknown>
  /**
   * Called by each step's form `onSubmit`. Merges `stepValues` into
   * `accumulatedValues` and advances to the next step.
   */
  completeStep: (stepValues: Record<string, unknown>) => void
  /** Return to the previous step. */
  retreat: () => void
  /**
   * Trigger the wizard's `onComplete` callback with all accumulated values.
   * Intended for the final review step, which has no form of its own.
   */
  complete: () => void | Promise<void>
  isCompleting: boolean
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const WizardContext = React.createContext<WizardContextValue | null>(null)

/**
 * Returns the nearest `<Wizard>` context. Throws if called outside a wizard.
 */
export function useWizard(): WizardContextValue {
  const ctx = React.useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used inside <Wizard>')
  return ctx
}

// ---------------------------------------------------------------------------
// WizardStepNav
// ---------------------------------------------------------------------------

/**
 * Visual step-progress bar rendered at the top of every `<Wizard>`.
 * Reads state from the nearest `WizardContext`.
 */
export function WizardStepNav() {
  const { steps, currentStepIndex } = useWizard()
  return (
    <nav aria-label="Form steps">
      <ol className="flex w-full list-none items-center p-0">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const state =
            index < currentStepIndex ? 'complete' : index === currentStepIndex ? 'active' : 'idle'

          return (
            <React.Fragment key={step.id}>
              <li
                className="flex items-center gap-2"
                aria-current={state === 'active' ? 'step' : undefined}
              >
                <div className={wizardStepBubbleVariants({ state })}>
                  {state === 'complete' ? (
                    <>
                      <CheckIcon className="size-4" aria-hidden />
                      <span className="sr-only">Completed</span>
                    </>
                  ) : (
                    <span aria-hidden>{index + 1}</span>
                  )}
                </div>
                <span className={wizardStepLabelVariants({ state })}>{step.label}</span>
              </li>

              {!isLast && (
                <li role="presentation" aria-hidden className="flex flex-1 px-2">
                  <div
                    className={cn(
                      'w-full',
                      wizardConnectorVariants({
                        state: index < currentStepIndex ? 'complete' : 'idle',
                      }),
                    )}
                  />
                </li>
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// WizardFooter
// ---------------------------------------------------------------------------

export interface WizardFooterProps {
  /**
   * Whether the current step's form is valid. When `false`, the Next button is
   * disabled. Defaults to `true` (no validation gate).
   */
  isValid?: boolean
  /** Mirrors `formState.isSubmitting` — disables both buttons while pending. */
  isSubmitting?: boolean
  /** Label for the Next button on intermediate steps. Defaults to `"Next"`. */
  nextLabel?: string
  /** Label for the submit button on the last step. Defaults to `"Submit"`. */
  submitLabel?: string
  className?: string
}

/**
 * Navigation footer for wizard steps. Renders a Back button (except on step 1)
 * and a Next / Submit button.
 *
 * Place inside the `footer` render prop of a `<Form>` so the submit button
 * triggers RHF validation before advancing:
 *
 * ```tsx
 * <Form
 *   schema={schema}
 *   fields={fields}
 *   onSubmit={wizard.completeStep}
 *   footer={(form) => (
 *     <WizardFooter
 *       isValid={form.formState.isValid}
 *       isSubmitting={form.formState.isSubmitting}
 *     />
 *   )}
 * />
 * ```
 *
 * For a review step with no `<Form>`, wrap in a plain `<form>` whose `onSubmit`
 * calls `wizard.complete()`:
 *
 * ```tsx
 * <form onSubmit={(e) => { e.preventDefault(); void wizard.complete() }}>
 *   ...
 *   <WizardFooter submitLabel="Create Campaign" />
 * </form>
 * ```
 */
export function WizardFooter({
  isValid = true,
  isSubmitting = false,
  nextLabel = 'Next',
  submitLabel = 'Submit',
  className,
}: WizardFooterProps) {
  const { isFirstStep, isLastStep, retreat, isCompleting } = useWizard()
  const pending = isSubmitting || isCompleting
  const label = isLastStep ? submitLabel : nextLabel

  return (
    <div className={cn(wizardFooterVariants(), className)}>
      {!isFirstStep && (
        <Button type="button" variant="outline" onClick={retreat} disabled={pending}>
          Back
        </Button>
      )}
      <Button type="submit" className="ml-auto" disabled={!isValid || pending} aria-busy={pending}>
        {label}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------------------

export interface WizardProps {
  /** Ordered step definitions. Must match the number of children. */
  steps: WizardStepDef[]
  /**
   * Called with the merged values from all completed steps when the last step
   * is submitted.
   */
  onComplete: (values: Record<string, unknown>) => void | Promise<void>
  /** Values available to every step before the user makes edits. */
  initialValues?: Record<string, unknown>
  /**
   * Optional hint rendered beneath the step nav, e.g.
   * "You can change these settings later from Campaign Settings."
   */
  hint?: string
  className?: string
  /**
   * One React node per step, indexed to match `steps`. Only the active step
   * is rendered at a time.
   */
  children: React.ReactNode
}

/**
 * Generic multi-step form wizard. Schema-agnostic: each step owns its own
 * `<Form>` with its own Zod schema. Step values are merged via
 * `wizard.completeStep(values)` and submitted together via `onComplete`.
 *
 * ```tsx
 * <Wizard steps={STEPS} onComplete={handleSubmit}>
 *   <StepOne />
 *   <StepTwo />
 *   <ReviewStep />
 * </Wizard>
 * ```
 */
export function Wizard({
  steps,
  onComplete,
  initialValues = {},
  hint,
  className,
  children,
}: WizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0)
  const [accumulatedValues, setAccumulatedValues] =
    React.useState<Record<string, unknown>>(initialValues)
  const [isCompleting, setIsCompleting] = React.useState(false)

  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  const completeStep = React.useCallback(
    (stepValues: Record<string, unknown>) => {
      setAccumulatedValues((prev) => ({ ...prev, ...stepValues }))
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex((i) => i + 1)
      }
    },
    [currentStepIndex, steps.length],
  )

  const retreat = React.useCallback(() => {
    if (currentStepIndex > 0) setCurrentStepIndex((i) => i - 1)
  }, [currentStepIndex])

  const complete = React.useCallback(async () => {
    setIsCompleting(true)
    try {
      await onComplete(accumulatedValues)
    } finally {
      setIsCompleting(false)
    }
  }, [accumulatedValues, onComplete])

  const ctxValue = React.useMemo<WizardContextValue>(
    () => ({
      currentStepIndex,
      steps,
      isFirstStep,
      isLastStep,
      accumulatedValues,
      completeStep,
      retreat,
      complete,
      isCompleting,
    }),
    [
      currentStepIndex,
      steps,
      isFirstStep,
      isLastStep,
      accumulatedValues,
      completeStep,
      retreat,
      complete,
      isCompleting,
    ],
  )

  const childArray = React.Children.toArray(children)
  const activeChild = childArray[currentStepIndex]

  return (
    <WizardContext.Provider value={ctxValue}>
      <div className={cn('space-y-6', className)}>
        <WizardStepNav />
        {hint && <Text variant="small">{hint}</Text>}
        <div>{activeChild}</div>
      </div>
    </WizardContext.Provider>
  )
}
