import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { FieldLabelContent } from './field-label-content'
import { fieldLabelVariants, fieldSetInFlowLegendClasses } from './field.variants'
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
            <legend
              className={`${fieldSetInFlowLegendClasses} ${fieldLabelVariants({ size: 'md' })}`}
            >
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

  it('keeps below-label hint inside the legend cluster', () => {
    render(
      <FieldsetChromeFrame errorId="scores-error" fieldsetProps={{ id: 'scores-fieldset' }}>
        <FieldsetChromeAnatomy
          hint="Drag to reorder."
          hintId="scores-hint"
          legend={
            <legend
              className={`${fieldSetInFlowLegendClasses} ${fieldLabelVariants({ size: 'md' })}`}
            >
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
    expect(hint.parentElement).toHaveClass('gap-1')
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
            <legend
              className={`${fieldSetInFlowLegendClasses} ${fieldLabelVariants({ size: 'md' })}`}
            >
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
    expect(fieldset?.parentElement).toHaveClass('space-y-1.5')
    expect(fieldset).toHaveClass('space-y-1.5')
  })
})
