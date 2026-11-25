import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Field } from './field.client'
import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { resolveFieldAutoRowIntrinsicSizing } from './field-intrinsic-row.lib'
import { FieldLayout } from './field-layout'
import { resolveFieldRowAnatomyPresentation } from './field-row-anatomy.variants'

describe('resolveFieldAutoRowIntrinsicSizing', () => {
  it('enables only for auto width in anatomy rows', () => {
    expect(resolveFieldAutoRowIntrinsicSizing('auto', true)).toBe(true)
    expect(resolveFieldAutoRowIntrinsicSizing('full', true)).toBe(false)
    expect(resolveFieldAutoRowIntrinsicSizing('auto', false)).toBe(false)
  })
})

describe('auto row intrinsic layout structure', () => {
  it('splits label and below-label hint into sizing and spill wrappers', () => {
    const presentation = resolveFieldRowAnatomyPresentation(['auto', 'auto'])
    const { container } = render(
      <FieldRowAnatomyProvider>
        <div
          data-field-row-anatomy=""
          className={presentation.className}
          style={presentation.style}
        >
          <Field.Root id="modes" width="auto" hint="Helper copy." anatomy rowParticipation>
            <FieldLayout
              label={<Field.Label>Modes</Field.Label>}
              control={<input aria-label="Modes" />}
            />
          </Field.Root>
        </div>
      </FieldRowAnatomyProvider>,
    )

    const labelRegion = container.querySelector('[data-field-label-region]')
    expect(labelRegion?.querySelector('[data-field-intrinsic-sizing]')).toBeTruthy()
    expect(labelRegion?.querySelector('[data-field-intrinsic-spill]')).toBeTruthy()
    expect(screen.getByText('Helper copy.')).toHaveAttribute('id', 'modes-hint')
    expect(container.querySelector('[data-field-width="auto"]')).toBeTruthy()
  })

  it('keeps stacked label+hint without spill wrappers outside anatomy auto rows', () => {
    const { container } = render(
      <Field.Root id="name" width="full" hint="Helper copy." anatomy>
        <FieldLayout
          label={<Field.Label>Name</Field.Label>}
          control={<input aria-label="Name" />}
        />
      </Field.Root>,
    )
    expect(container.querySelector('[data-field-intrinsic-spill]')).toBeNull()
  })
})
