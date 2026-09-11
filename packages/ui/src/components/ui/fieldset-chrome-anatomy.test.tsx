import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { FieldLabelContent } from './field-label-content'
import { fieldSetInFlowLegendClasses } from './field.variants'
import { FieldsetChromeAnatomy, FieldsetChromeFrame } from './fieldset-chrome-anatomy'
import { TextField } from './text-field'

describe('FieldsetChromeFrame', () => {
  it('keeps legend as a direct fieldset child outside the chrome shell border', () => {
    const { container } = render(
      <FieldsetChromeFrame
        chrome={{ variant: 'container' }}
        errorId="scores-error"
        fieldsetProps={{ id: 'scores-fieldset' }}
      >
        <FieldsetChromeAnatomy
          hintId="scores-hint"
          legend={
            <legend id="scores-legend">
              <FieldLabelContent label="Ability scores" />
            </legend>
          }
        >
          <TextField id="score" label="Score" />
        </FieldsetChromeAnatomy>
      </FieldsetChromeFrame>,
    )

    const fieldset = container.querySelector('fieldset')
    const legend = screen.getByText('Ability scores').closest('legend')

    expect(fieldset).toContainElement(legend)
    expect(fieldset?.parentElement).not.toBe(legend?.parentElement)
  })

  it('keeps below-label hint inside the legend cluster with a 2px stack gap', () => {
    render(
      <FieldsetChromeFrame errorId="scores-error" fieldsetProps={{ id: 'scores-fieldset' }}>
        <FieldsetChromeAnatomy
          hint="Drag to reorder."
          hintId="scores-hint"
          legend={
            <legend id="scores-legend">
              <FieldLabelContent label="Ability scores" />
            </legend>
          }
        >
          <TextField id="score" label="Score" />
        </FieldsetChromeAnatomy>
      </FieldsetChromeFrame>,
    )

    const hint = screen.getByText('Drag to reorder.')
    const legend = screen.getByText('Ability scores').closest('legend')
    expect(legend).toContainElement(hint)
    expect(hint.parentElement).toHaveClass('gap-0.5')
    expect(legend).toHaveClass('contents')
  })

  it('keeps below-label hint visible when an error is present', () => {
    render(
      <FieldsetChromeFrame
        error="Add at least one ability."
        errorId="scores-error"
        fieldsetProps={{ id: 'scores-fieldset' }}
      >
        <FieldsetChromeAnatomy
          hint="Select up to 2 abilities."
          hintId="scores-hint"
          legend={
            <legend id="scores-legend">
              <FieldLabelContent label="Primary abilities" />
            </legend>
          }
        >
          <TextField id="score" label="Score" />
        </FieldsetChromeAnatomy>
      </FieldsetChromeFrame>,
    )

    expect(screen.getByText('Select up to 2 abilities.')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Add at least one ability.')
  })

  it('applies anatomy on the wrapper that owns fieldset and error', () => {
    const { container } = render(
      <FieldsetChromeFrame
        error="Add at least one ability."
        errorId="scores-error"
        fieldsetProps={{ id: 'scores-fieldset' }}
      >
        <FieldsetChromeAnatomy
          hintId="scores-hint"
          legend={
            <legend id="scores-legend">
              <FieldLabelContent label="Ability scores" />
            </legend>
          }
        >
          <TextField id="score" label="Score" />
        </FieldsetChromeAnatomy>
      </FieldsetChromeFrame>,
    )

    const fieldset = container.querySelector('fieldset')
    const error = screen.getByRole('alert')

    expect(fieldset?.parentElement).toContainElement(error)
    expect(fieldset?.parentElement).toHaveClass('gap-y-1.5')
    expect(fieldset).toHaveClass('gap-y-1.5')
  })

  it('uses contents on the legend so fieldset gap applies to the label cluster', () => {
    render(
      <FieldsetChromeFrame errorId="scores-error" fieldsetProps={{ id: 'scores-fieldset' }}>
        <FieldsetChromeAnatomy
          hintId="scores-hint"
          legend={
            <legend id="scores-legend">
              <FieldLabelContent label="Hit die" />
            </legend>
          }
        >
          <div data-testid="chip-wrap">chips</div>
        </FieldsetChromeAnatomy>
      </FieldsetChromeFrame>,
    )

    const legend = screen.getByText('Hit die').closest('legend')
    const chipWrap = screen.getByTestId('chip-wrap')

    expect(legend).toHaveClass(...fieldSetInFlowLegendClasses.split(/\s+/))
    expect(legend?.nextElementSibling).toBe(chipWrap)
  })
})
