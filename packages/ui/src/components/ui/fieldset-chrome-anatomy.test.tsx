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
})
