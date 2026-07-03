import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { FieldRow } from './field-row'
import { InlineSentenceField } from './inline-sentence-field.client'
import { SelectField } from './select-field'

describe('ChooseCountFieldShell', () => {
  it('applies row width tokens to inline sentence fieldsets', () => {
    render(
      <FieldRow>
        <SelectField
          id="sense-type"
          label="Sense type"
          width="2/3"
          options={[{ label: 'Darkvision', value: 'darkvision' }]}
        />
        <InlineSentenceField
          id="sense-range"
          label="Range"
          width="1/3"
          segments={[
            {
              kind: 'select',
              name: 'senseRange',
              options: [{ label: '60', value: '60' }],
            },
            { kind: 'text', value: 'ft.', tone: 'label' },
          ]}
          controls={[
            {
              kind: 'select',
              id: 'sense-range-select',
              name: 'senseRange',
              value: '60',
              options: [{ label: '60', value: '60' }],
              ariaLabel: 'Range',
            },
          ]}
        />
      </FieldRow>,
    )

    const senseTypeRoot = screen.getByLabelText('Sense type').closest('.grow-\\[8\\]')
    const rangeFieldset = screen.getByLabelText('Range').closest('fieldset')

    expect(senseTypeRoot).toHaveClass('max-w-2/3')
    expect(rangeFieldset).toHaveClass('grow-[4]', 'max-w-1/3')
  })
})
